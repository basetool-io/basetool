import { inProduction } from "@/lib/environment";
import { useIntercom } from "react-use-intercom";
import { useSession } from "next-auth/client";
import { useWindowSize } from "react-use";
import React, { useEffect, useMemo } from "react";
import classNames from "classnames";

function Error({ statusCode }: any) {
  const [session, sessionIsLoading] = useSession();
  const { boot, update, show } = useIntercom();
  const { width, height } = useWindowSize();
  const centerText = useMemo(() => width >= 1200, [width]);
  const shouldShow = useMemo(() => {
    if (width <= 450 && height <= 890) return false; // mobile view

    return true;
  }, [width, height]);

  useEffect(() => {
    // Boot up the Intercom widget
    if (inProduction) {
      boot();
      if (shouldShow) {
        show();
      }
    }
  }, []);

  useEffect(() => {
    // Update Intercom with the user's info
    if (inProduction && !sessionIsLoading && session) {
      update({
        name: session?.user?.name,
        email: session?.user?.email,
        createdAt: session?.user?.createdAt?.toString(),
        userHash: session?.user?.intercomUserHash,
      });
    }
  }, [sessionIsLoading, session]);

  return (
    <div>
      {/* {statusCode
        ? `2An error ${statusCode} occurred on server`
        : '2An error occurred on client'} */}
      <div
        className={classNames(
          "absolute flex justify-center h-full w-full inset-0 z-20 rounded-xl text-center bg-white text-gray-900",
          {
            "items-center": centerText,
          }
        )}
      >
        Apologies. Sometimes we make mistakes too...
        <br />
        Do you want to share some details about this issue? {centerText && "👉"}
        {centerText || "👇"}
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;

  return { statusCode };
};

export default Error;

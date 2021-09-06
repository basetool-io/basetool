import { inProduction } from "@/lib/environment"
import { useIntercom } from "react-use-intercom";
import { useSession } from "next-auth/client";
import React, { useEffect } from "react";


function Error({ statusCode }: any) {
  const [session, sessionIsLoading] = useSession();
  const { boot, update } = useIntercom();

  useEffect(() => {
    // Boot up the Intercom widget
    if (inProduction) boot();
  }, []);

  useEffect(() => {
    // Update Intercom with the user's info
    if (inProduction && !sessionIsLoading && session) {
      update({
        name: session.user.name,
        email: session.user.email,
        createdAt: session.user.createdAt.toString(),
        customAttributes: {
        },
      });
    }
  }, [sessionIsLoading, session]);

  return (
    <p>
      {statusCode
        ? `2An error ${statusCode} occurred on server`
        : '2An error occurred on client'}
      <div className="absolute flex items-center justify-center h-full w-full inset-0 bg-opacity-75 z-20 rounded-xl">
        Something went wrong
      </div>
    </p>
  )
}

Error.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404

return { statusCode }
}

export default Error

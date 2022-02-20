import { inProduction } from "@/lib/environment";
import { intercomAppId } from "@/lib/services"
// import { useIntercom } from "react-use-intercom";
// import { useSession } from "next-auth/client";
import HeadSection from "./HeadSection";
import React, { ReactNode, useEffect } from "react";
import classNames from "classnames";

function Layout({ children }: { children: ReactNode }) {
  // const [session, sessionIsLoading] = useSession();
  // const { boot, update } = useIntercom();

  // useEffect(() => {
  //   // Boot up the Intercom widget
  //   if (inProduction && intercomAppId) boot();
  // }, []);

  // useEffect(() => {
  //   // Update Intercom with the user's info
  //   if (inProduction && !sessionIsLoading && session && intercomAppId) {
  //     update({
  //       name: session?.user?.name,
  //       email: session?.user?.email,
  //       createdAt: session?.user?.createdAt?.toString(),
  //       userHash: session?.user?.intercomUserHash,
  //     });
  //   }
  // }, [sessionIsLoading, session]);

  return (
    <>
      <HeadSection />
      <div className="flex w-screen h-screen">
        <div
          className={classNames(
            "flex-1 flex bg-cool-gray-100 rounded-lg shadow w-[calc(100%-1rem)] h-[calc(100%-1rem)] m-2"
          )}
        >
          <div className="flex-1 flex flex-col w-full h-full overflow-auto">
            <div className="relative flex flex-1 w-full max-h-full">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Layout;

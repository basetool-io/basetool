import { inProduction } from "@/lib/environment";
import { useIntercom } from "react-use-intercom";
import { useSession } from "next-auth/client";
import Favicons from "./Favicons"
import Head from "next/head";
import React, { ReactNode, useEffect } from "react";
import classNames from "classnames";
import meta from "@/lib/siteMeta";

function Layout({ children }: { children: ReactNode }) {
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
        name: session?.user?.name,
        email: session?.user?.email,
        createdAt: session?.user?.createdAt?.toString(),
        userHash: session?.user?.intercomUserHash,
      });
    }
  }, [sessionIsLoading, session]);

  return (
    <>
      <Head>
        <title>{meta.title} 👋</title>
        <meta name="description" content={meta.description} />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content={meta.twitter.handle} />
        <meta name="twitter:image" content={meta.imagePath} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={meta.url} />
        <meta property="og:image" content={meta.imagePath} />
        <meta property="og:image:width" content="1376" />
        <meta property="og:image:height" content="604" />
        <Favicons />
      </Head>
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

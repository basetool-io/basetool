import { inProduction } from "@/lib/environment";
import { useIntercom } from "react-use-intercom";
import { useRouter } from "next/router";
import { useSession } from "next-auth/client";
import Authenticated from "./Authenticated";
import DataSourcesSidebar from "./DataSourcesSidebar";
import Head from "next/head";
import React, { ReactNode, useEffect, useMemo } from "react";
import SettingsSidebar from "./SettingsSidebar";
import Sidebar from "./Sidebar";

function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [session, sessionIsLoading] = useSession();
  const tablesSidebarVisible = useMemo(() => {
    if (router.pathname.includes("/profile")) return false;
    if (router.pathname.includes("/settings")) return false;
    if (router.pathname === "/data-sources") return false;
    if (router.pathname === "/data-sources/google-sheets/new") return false;
    if (router.pathname === "/data-sources/postgresql/new") return false;
    if (router.pathname === "/data-sources/new") return false;

    return true;
  }, [router.pathname]);
  const settingsSidebarVisible = useMemo(
    () => router.pathname.includes("/settings"),
    [router.pathname]
  );
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
    <Authenticated>
      <>
        <Head>
          <title>👋 Hi!</title>
          <meta name="description" content="The Airtable to your database" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="flex w-screen h-screen">
          <DataSourcesSidebar />
          <div className="flex-1 flex bg-cool-gray-100 rounded-tl-lg shadow w-[calc(100%-5rem)] h-[calc(100%-0.5rem)] my-2">
            {(tablesSidebarVisible || settingsSidebarVisible) && (
              <div className="flex min-w-[14rem] max-w-[14rem]">
                {tablesSidebarVisible && <Sidebar />}
                {settingsSidebarVisible && <SettingsSidebar />}
              </div>
            )}
            <div className="flex-1 flex flex-col w-full h-full overflow-auto">
              <div className="relative flex flex-1 w-full max-h-full">
                {children}
              </div>
            </div>
          </div>
        </div>
      </>
    </Authenticated>
  );
}

export default Layout;

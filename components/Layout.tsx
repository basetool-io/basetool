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
    if (router.pathname === "/data-sources/new") return false;

    return true;
  }, [router.pathname]);
  const settingsSidebarVisible = useMemo(
    () => router.pathname.includes("/settings"),
    [router.pathname]
  );
  const { boot, update } = useIntercom();

  // Get the user's organization
  // const {data: organizationResponse}

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
          <div className="flex min-w-[4rem] max-w-[4rem]">
            <DataSourcesSidebar />
          </div>
          {tablesSidebarVisible && (
            <div className="flex min-w-[14rem] max-w-[14rem]">
              <Sidebar />
            </div>
          )}
          {settingsSidebarVisible && (
            <div className="flex min-w-[14rem] max-w-[14rem]">
              <SettingsSidebar />
            </div>
          )}
          <div className="flex-1 flex flex-col w-full h-full overflow-auto bg-cool-gray-100">
            <div className="relative flex flex-1 w-full max-h-full">
              {children}
            </div>
          </div>
        </div>
      </>
    </Authenticated>
  );
}

export default Layout;

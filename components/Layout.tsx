import { inProduction } from "@/lib/environment";
import { useIntercom } from "react-use-intercom";
import { useRouter } from "next/router";
import { useSession } from "next-auth/client";
import { useSidebarsVisible } from "@/hooks";
import Authenticated from "./Authenticated";
import DataSourcesSidebar from "./DataSourcesSidebar";
import Head from "next/head";
import React, { ReactNode, useEffect, useMemo } from "react";
import SettingsSidebar from "./OrganizationSidebar";
import Sidebar from "./Sidebar";
import classNames from "classnames";

function Layout({
  hideSidebar = false,
  children,
  sidebar,
}: {
  hideSidebar?: boolean;
  children: ReactNode;
  sidebar?: ReactNode;
}) {
  const router = useRouter();
  const [session, sessionIsLoading] = useSession();
  const tablesSidebarVisible = useMemo(() => {
    if (sidebar) return false;
    if (hideSidebar) return false;

    if (router.pathname.includes("/profile")) return false;
    if (router.pathname === "/data-sources") return false;
    if (router.pathname === "/data-sources/google-sheets/new") return false;
    if (router.pathname === "/data-sources/postgresql/new") return false;
    if (router.pathname === "/data-sources/new") return false;

    return true;
  }, [router.pathname]);
  // temporarily returning false until we figure out a better way of injecting the sidebar with dynamic values 👇
  const settingsSidebarVisible = useMemo(
    () => false && router.pathname.includes("/settings"),
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

  const [sidebarsVisible] = useSidebarsVisible();

  return (
    <Authenticated>
      <>
        <Head>
          <title>👋 Basetool!</title>
          <meta name="description" content="The Airtable to your database" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="flex w-screen h-screen">
          <DataSourcesSidebar />
          <div
            className={classNames(
              "flex-1 flex bg-cool-gray-100 rounded-tl-lg shadow h-[calc(100%-0.5rem)] my-2",
              {
                "w-[calc(100%-5rem)]": sidebarsVisible,
                "w-[calc(100%-0.5rem)] md:w-[calc(100%-5rem)]":
                  !sidebarsVisible,
              }
            )}
          >
            {(sidebar || tablesSidebarVisible || settingsSidebarVisible) && (
              <div
                className={classNames("flex", {
                  "min-w-[14rem] max-w-[14rem]": sidebarsVisible,
                  "w-0 md:min-w-[14rem] md:max-w-[14rem]": !sidebarsVisible,
                })}
              >
                {tablesSidebarVisible && <Sidebar />}
                {settingsSidebarVisible && <SettingsSidebar />}
                {sidebar}
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

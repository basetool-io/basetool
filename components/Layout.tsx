import { signOut, useSession } from "next-auth/client";
import Authenticated from "./Authenticated";
import Head from "next/head";
import Link from "next/link";
import React, { ReactNode } from "react";
import Sidebar from "./Sidebar";

const Nav = () => {
  const [session, sessionLoading] = useSession();

  return (
    <nav className="relative flex justify-between w-full py-2 px-2 shadow z-20">
      <div>
        <Link href={`/data-sources`}>Home</Link>
      </div>
      <div>
        {sessionLoading && (
          <div className="">
            <div className="w-32 animate-pulse flex space-x-2">
              <div className="rounded-full bg-blue-400 h-6 w-6 flex-shrink-0"></div>
              <div className="h-6 bg-blue-400 rounded w-3/4"></div>
            </div>
          </div>
        )}
        {sessionLoading || (
          <div className="">
            <div className="min-w-32 flex items-center space-x-2">
              <div className="rounded-full bg-blue-400 h-6 w-6 flex-shrink-0"></div>
              {session?.user && (
                <div className="h-6 rounded text-sm">
                  {session.user.firstName} {session.user.lastName}
                </div>
              )}
              <a
                href={"/api/auth/signout"}
                onClick={(e) => {
                  e.preventDefault();
                  signOut();
                }}
                className="flex-shrink-0 text-sm text-gray-700"
              >
                Sign Out
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

function Layout({ children }: { children: ReactNode }) {
  return (
    <Authenticated>
      <>
        <Head>
          <title>Basetool.io</title>
          <meta name="description" content="The Airtable to your database" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="flex flex-col w-full h-full">
          <div className="flex flex-1">
            <div className="flex min-w-[14rem] max-w-[14rem] border">
              <Sidebar />
            </div>
            <div className="flex flex-col w-full h-full overflow-auto">
              <Nav />
              <div className="flex flex-1 border w-full max-h-full bg-gray-100">
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

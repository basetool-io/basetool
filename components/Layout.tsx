import { useRouter } from 'next/router'
import React, { ElementType, ReactNode, useMemo } from 'react'
import Sidebar from './Sidebar'
import Head from 'next/head'
import Authenticated from "./Authenticated";

function Layout({
  providedSidebarComponent,
  children,
}: {
  providedSidebarComponent?: ElementType;
  children: ReactNode;
}) {
  const router = useRouter();
  // const [session, loading] = useSession()
  const SidebarComponent: ElementType = useMemo(
    () => providedSidebarComponent || Sidebar,
    [providedSidebarComponent]
  );

  // if (typeof window !== 'undefined' && loading) return null

  // If no session exists, redirect to login
  // if (!session) { return <Unauthenticated /> }

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
            <div className="w-1/4 border">
              <SidebarComponent />
            </div>
            <div className="flex-1 border h-full overflow-auto">{children}</div>
          </div>
        </div>
      </>
    </Authenticated>
  );
}

export default Layout

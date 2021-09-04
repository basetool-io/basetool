import { useGetDataSourcesQuery } from "@/features/data-sources/api-slice";
import { useSession } from "next-auth/client";
import Layout from "@/components/Layout";
import PageWrapper from "@/features/records/components/PageWrapper";
import React from "react";

function Index() {
  const {
    data: dataSourcesResponse,
    isLoading,
    error,
  } = useGetDataSourcesQuery();
  const [session, sessionIsLoading] = useSession();

  return (
    <Layout>
      <PageWrapper
        heading={`Welcome ${sessionIsLoading ? "" : session?.user?.firstName}`}
      >
        <>
          {error && <div>Error: {JSON.stringify(error)}</div>}
          {dataSourcesResponse?.ok && (
            <div>
              👈 You have {isLoading ? '🤷‍♂️ ⏳' : dataSourcesResponse.data.length} data sources available. Pick one from the  left sidebar.
            </div>
          )}
        </>
      </PageWrapper>
    </Layout>
  );
}

export default Index;

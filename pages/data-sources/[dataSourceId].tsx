import { skipToken } from "@reduxjs/toolkit/dist/query";
import { useGetTablesQuery } from "@/features/tables/tables-api-slice";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import React from "react";

function DataSourcesShow() {
  const router = useRouter();
  const dataSourceId = router.query.dataSourceId as string;
  const { data, error, isLoading } = useGetTablesQuery(
    dataSourceId ?? skipToken
  );

  if (error)
    return (
      <div>
        failed to load <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  if (!data) return <div>loading...</div>;

  return (
    <Layout>
      {isLoading && <div>loading...</div>}
      {error && <div>Error: {JSON.stringify(error)}</div>}
      {!isLoading && data?.ok && "Please select a table"}
    </Layout>
  );
}

export default DataSourcesShow;

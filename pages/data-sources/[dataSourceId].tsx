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

  return (
    <Layout>
      {isLoading && <div>loading data sources...</div>}
      {error && <div>Error: {JSON.stringify(error)}</div>}
      {!isLoading && data?.ok && "Please select a table"}
    </Layout>
  );
}

export default DataSourcesShow;

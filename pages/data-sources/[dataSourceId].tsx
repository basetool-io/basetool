import { skipToken } from "@reduxjs/toolkit/dist/query";
import { useGetTablesQuery } from "@/features/tables/api-slice";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import LoadingOverlay from "@/components/LoadingOverlay"
import React from "react";
import isEmpty from "lodash/isEmpty"

function DataSourcesShow() {
  const router = useRouter();
  const dataSourceId = router.query.dataSourceId as string;
  const { data, error, isLoading } = useGetTablesQuery(
    dataSourceId ?? skipToken
  );

  return (
    <Layout>
      {isLoading && <LoadingOverlay transparent={isEmpty(data?.data)} />}
      {error && <div>Error: {JSON.stringify(error)}</div>}
      {!isLoading && data?.ok && <div className="p-4">👈  &nbsp;Select a table to get started.</div>}
    </Layout>
  );
}

export default DataSourcesShow;

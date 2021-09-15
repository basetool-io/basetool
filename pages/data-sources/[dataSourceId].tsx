import { skipToken } from "@reduxjs/toolkit/dist/query";
import { useGetDataSourceQuery } from "@/features/data-sources/api-slice";
import { useGetTablesQuery } from "@/features/tables/api-slice";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import LoadingOverlay from "@/components/LoadingOverlay";
import PageWrapper from "@/components/PageWrapper";
import React from "react";
import isEmpty from "lodash/isEmpty";

function DataSourcesShow() {
  const router = useRouter();
  const dataSourceId = router.query.dataSourceId as string;
  const { data, error, isLoading } = useGetTablesQuery(
    dataSourceId ?? skipToken
  );
  const { data: dataSourceResponse } = useGetDataSourceQuery(
    { dataSourceId },
    {
      skip: !dataSourceId,
    }
  );

  return (
    <Layout>
      {isLoading && <LoadingOverlay transparent={isEmpty(data?.data)} />}
      {error && <div>Error: {JSON.stringify(error)}</div>}
      {!isLoading && data?.ok && (
        <PageWrapper heading={dataSourceResponse?.data?.name}>
          <>👈 &nbsp;Select a table to get started.</>
        </PageWrapper>
      )}
    </Layout>
  );
}

export default DataSourcesShow;

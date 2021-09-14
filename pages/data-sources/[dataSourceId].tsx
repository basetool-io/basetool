import { isNull } from "lodash"
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { useGetDataSourceQuery } from "@/features/data-sources/api-slice";
import { useGetTablesQuery } from "@/features/tables/api-slice";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import LoadingOverlay from "@/components/LoadingOverlay";
import PageWrapper from "@/components/PageWrapper";
import React, { useEffect } from "react";
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

  useEffect(() => {
    async function redirectToSetup () {
      await router.push(`${router.asPath}/setup`);
    }

    // If the Google Sheets datasource lacks the spreadsheetId attribute, we're going to redirect to setup.
    if (
      dataSourceResponse?.ok &&
      dataSourceResponse?.data?.type === "google-sheets" &&
      isNull(dataSourceResponse?.data?.options?.spreadsheetId)
    ) {
      redirectToSetup()
    }
  }, [dataSourceResponse]);

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

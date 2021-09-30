import { Views } from "@/features/fields/enums";
import { getFilteredColumns } from "@/features/fields"
import { isEmpty } from "lodash";
import { useGetColumnsQuery } from "@/features/tables/api-slice";
import { useGetRecordQuery } from "@/features/records/api-slice";
import { useRouter } from "next/router";
import Form from "@/features/records/components/Form";
import Layout from "@/components/Layout";
import LoadingOverlay from "@/components/LoadingOverlay";
import React, { useMemo } from "react";

function RecordsEdit() {
  const router = useRouter();
  const dataSourceId = router.query.dataSourceId as string;
  const tableName = router.query.tableName as string;
  const recordId = router.query.recordId as string;
  const { data: recordResponse, error, isLoading } = useGetRecordQuery(
    {
      dataSourceId,
      tableName,
      recordId,
    },
    { skip: !dataSourceId || !tableName || !recordId }
  );
  const { data: columnsResponse } = useGetColumnsQuery(
    {
      dataSourceId,
      tableName,
    },
    { skip: !dataSourceId || !tableName }
  );

  const columns = useMemo(
    () => getFilteredColumns(columnsResponse?.data, Views.index),
    [columnsResponse?.data]
  );

  return (
    <Layout>
      {isLoading && <LoadingOverlay transparent={isEmpty(recordResponse?.data)} />}
      {error && <div>Error: {JSON.stringify(error)}</div>}
      {!isLoading && recordResponse?.ok && columnsResponse?.ok && (
        <Form record={recordResponse.data} columns={columns} />
      )}
    </Layout>
  );
}

export default RecordsEdit;

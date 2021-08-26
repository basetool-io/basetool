import { Column } from "@/features/fields/types";
import { Views } from "@/features/fields/enums";
import { useGetColumnsQuery } from "@/features/tables/tables-api-slice";
import { useGetRecordQuery } from "@/features/records/records-api-slice";
import { useRouter } from "next/router";
import Form from "@/features/records/components/Form";
import Layout from "@/components/Layout";
import React, { useMemo } from "react";
import isArray from "lodash/isArray";

function RecordsEdit() {
  const router = useRouter();
  const dataSourceId = router.query.dataSourceId as string;
  const tableName = router.query.tableName as string;
  const recordId = router.query.recordId as string;
  const { data, error, isLoading } = useGetRecordQuery(
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
    () =>
      isArray(columnsResponse?.data)
        ? columnsResponse?.data.filter((column: Column) =>
            column.baseOptions.visibility?.includes(Views.edit)
          )
        : [],
    [columnsResponse?.data]
  ) as Column[];

  return (
    <Layout>
      {isLoading && <div>loading...</div>}
      {error && <div>Error: {JSON.stringify(error)}</div>}
      {!isLoading && data?.ok && columnsResponse?.ok && (
        <Form record={data.data} columns={columns} />
      )}
    </Layout>
  );
}

export default RecordsEdit;

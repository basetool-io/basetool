import { Views } from "@/features/fields/enums";
import { isArray } from "lodash";
import { useGetColumnsQuery } from "@/features/tables/tables-api-slice";
import { useRouter } from "next/router";
import Form from "@/features/records/components/Form";
import React, { useMemo } from "react";
import Layout from "@/components/Layout";
import { Column } from "@/features/fields/types";

function New() {
  const router = useRouter();
  const dataSourceId = router.query.dataSourceId as string;
  const tableName = router.query.tableName as string;
  const {
    data: columnsResponse,
    isLoading,
    error,
  } = useGetColumnsQuery(
    {
      dataSourceId,
      tableName,
    },
    { skip: !dataSourceId || !tableName }
  );

  const columns = useMemo(
    () =>
      isArray(columnsResponse?.data)
        ? columnsResponse?.data.filter(
            (column: Column) =>
              column?.visibility?.includes(Views.new) && !column.primaryKey
          )
        : [],
    [columnsResponse?.data]
  ) as Column[];

  return (
    <Layout>
      {isLoading && <div>loading...</div>}
      {error && <div>Error: {JSON.stringify(error)}</div>}
      {!isLoading && columnsResponse?.ok && (
        <Form record={{}} isCreating={true} columns={columns} />
      )}
    </Layout>
  );
}

export default New;

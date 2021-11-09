import { Column } from "@/features/fields/types";
import { Views } from "@/features/fields/enums";
import { getFilteredColumns } from "@/features/fields";
import { isEmpty } from "lodash";
import { useDataSourceContext } from "@/hooks";
import { useGetColumnsQuery } from "@/features/fields/api-slice";
import Form from "@/features/records/components/Form";
import Layout from "@/components/Layout";
import LoadingOverlay from "@/components/LoadingOverlay";
import React, { memo, useMemo } from "react";

const NewRecord = () => {
  const { dataSourceId, tableName } = useDataSourceContext();
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
      getFilteredColumns(columnsResponse?.data, Views.new).filter(
        (column: Column) => !column.primaryKey
      ),
    [columnsResponse?.data]
  );

  return (
    <Layout>
      {isLoading && (
        <LoadingOverlay transparent={isEmpty(columnsResponse?.data)} />
      )}
      {error && <div>Error: {JSON.stringify(error)}</div>}
      {!isLoading && columnsResponse?.ok && (
        <Form record={{}} formForCreate={true} columns={columns} />
      )}
    </Layout>
  );
};

export default memo(NewRecord);

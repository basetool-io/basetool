import { Column } from "@/features/fields/types";
import { Views } from "@/features/fields/enums";
import { isArray, isEmpty } from "lodash";
import { useDataSourceContext } from "@/hooks";
import { useGetColumnsQuery } from "@/features/tables/api-slice";
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
      isArray(columnsResponse?.data)
        ? columnsResponse?.data.filter(
            (column: Column) =>
              column.baseOptions.visibility?.includes(Views.new) &&
              !column.primaryKey
          )
        : [],
    [columnsResponse?.data]
  ) as Column[];

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

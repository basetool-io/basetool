import { ListTable } from "@/plugins/data-sources/abstract-sql-query-service/types";
import { isUndefined } from "lodash";
import { useGetColumnsQuery } from "../fields/api-slice";
import { useGetTablesQuery } from "./api-slice";
import { useMemo } from "react";

export const useTablesResponse = (
  dataSourceId?: string,
  options?: { skip?: boolean }
) => {
  const skipCondition = isUndefined(options?.skip)
    ? { skip: !dataSourceId }
    : { skip: !dataSourceId };
  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useGetTablesQuery({ dataSourceId }, skipCondition);

  const tables: ListTable[] = useMemo(
    () => (response?.ok ? response.data : []),
    [response]
  );

  return {
    tables,
    response,
    isLoading,
    isFetching,
    refetch,
    error,
  };
};

export const useColumnsResponse = (
  {
    dataSourceId,
    tableName,
    viewId,
  }: { dataSourceId?: string; tableName?: string; viewId?: string },
  options?: { skip?: boolean }
) => {
  const skipCondition = isUndefined(options?.skip)
    ? { skip: !dataSourceId || !viewId }
    : { skip: options?.skip };
  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useGetColumnsQuery(
    {
      dataSourceId,
      tableName,
      viewId,
    },
    skipCondition
  );

  const columns: ListTable[] = useMemo(
    () => (response?.ok ? response.data : []),
    [response]
  );

  return {
    columns,
    response,
    isLoading,
    isFetching,
    refetch,
    error,
  };
};

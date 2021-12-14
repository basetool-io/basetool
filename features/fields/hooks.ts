import { Column } from "./types";
import { useGetColumnsQuery } from "./api-slice";
import { useMemo } from "react";

export const useColumnsResponse = ({
  dataSourceId,
  tableName,
}: {
  dataSourceId: string;
  tableName: string;
}) => {
  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useGetColumnsQuery(
    { dataSourceId, tableName },
    { skip: !dataSourceId || !tableName }
  );

  const columns: Column[] = useMemo(
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

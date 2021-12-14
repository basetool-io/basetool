import { TableResponse } from "./types";
import { useGetTablesQuery } from "./api-slice";
import { useMemo } from "react";

export const useTablesResponse = ({
  dataSourceId,
}: {
  dataSourceId: string;
}) => {
  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useGetTablesQuery({ dataSourceId }, { skip: !dataSourceId });

  const tables: TableResponse[] = useMemo(
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

import { DataSource } from "@prisma/client";
import { useGetDataSourceQuery } from "./api-slice";
import { useMemo } from "react";

export const useDataSourceResponse = (dataSourceId: string) => {
  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useGetDataSourceQuery({ dataSourceId }, { skip: !dataSourceId });

  const dataSource: DataSource | undefined = useMemo(
    () => response?.ok && response.data,
    [response]
  );

  const info = useMemo(() => {
    if (response && response.ok) {
      return response.meta?.dataSourceInfo;
    }

    return {};
  }, [response]);

  return {
    dataSource,
    response,
    isLoading,
    isFetching,
    refetch,
    error,
    info,
  };
};

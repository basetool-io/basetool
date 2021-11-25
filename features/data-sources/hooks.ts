import { useGetDataSourceQuery } from "./api-slice";
import { useMemo } from "react";

export const useDataSourceResponse = (dataSourceId: string) => {
  const {
    data: response,
    isLoading,
    isFetching,
  } = useGetDataSourceQuery({ dataSourceId }, { skip: !dataSourceId });

  const info = useMemo(() => {
    if (response && response.ok) {
      return response.meta?.dataSourceInfo;
    }

    return {};
  }, [response]);

  return {
    response,
    isLoading,
    isFetching,
    info,
  };
};

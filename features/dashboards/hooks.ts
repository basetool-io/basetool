import { Dashboard } from "@prisma/client";
import { useGetDashboardQuery } from "./api-slice";
import { useMemo } from "react";

export const useDashboardResponse = (dashboardId: string) => {
  const {
    data: response,
    isLoading,
    isFetching,
    error,
  } = useGetDashboardQuery({ dashboardId }, { skip: !dashboardId });

  const dashboard: Dashboard | undefined = useMemo(
    () => response?.ok && response.data,
    [response]
  );

  const dashboardItems = useMemo(() => dashboard ? dashboard?.dashboardItems : [], [dashboard]);

  return {
    dashboard,
    response,
    isLoading,
    isFetching,
    error,
    dashboardItems
  };
};

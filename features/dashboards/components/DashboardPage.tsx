import { DashboardItem } from "@prisma/client";
import { useDashboardResponse } from "../hooks";
import { useDataSourceContext } from "@/hooks";
import { useGetDashboardItemsValuesQuery } from "../api-slice";
import DashboardItemView from "./DashboardItemView";
import React, { useMemo } from "react";

function DashboardPage() {
  const { dashboardId } = useDataSourceContext();

  const { isLoading: dashboardIsLoading, dashboardItems } =
    useDashboardResponse(dashboardId);

  const {
    data: dashboardItemsValuesResponse,
    isLoading: dashboardItemsValuesIsLoading,
  } = useGetDashboardItemsValuesQuery({ dashboardId }, { skip: !dashboardId });

  const dashboardItemsValues: any = useMemo(
    () =>
      dashboardItemsValuesResponse?.ok &&
      Object.fromEntries(
        dashboardItemsValuesResponse.data.map(
          (itemValue: { id: number; value?: string; error?: string }) => [
            itemValue.id,
            { value: itemValue.value, error: itemValue.error },
          ]
        )
      ),
    [dashboardItemsValuesResponse]
  );

  return (
    <div className="relative flex flex-col flex-1 w-full h-full p-2">
      {!dashboardIsLoading && dashboardItems.length === 0 && (
        <div className="flex flex-1 justify-center items-center text-lg font-semibold text-gray-600 h-full">
          No widgets found
        </div>
      )}
      {!dashboardIsLoading && dashboardItems.length > 0 && (
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {dashboardItems.map((dashboardItem: DashboardItem, idx: number) => (
            <DashboardItemView
              key={idx}
              dashboardItem={dashboardItem}
              valueResponse={
                dashboardItemsValues
                  ? dashboardItemsValues[dashboardItem.id]
                  : undefined
              }
              isLoading={dashboardItemsValuesIsLoading}
            />
          ))}
        </dl>
      )}
    </div>
  );
}

export default DashboardPage;

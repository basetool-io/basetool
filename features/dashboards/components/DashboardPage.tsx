import { DashboardItem } from "@prisma/client";
import { useDashboardResponse } from "../hooks";
import { useDataSourceContext } from "@/hooks";
import DashboardItemView from "./DashboardItemView";
import React from "react";

function DashboardPage() {
  const { dashboardId } = useDataSourceContext();

  const { isLoading: dashboardIsLoading, dashboardItems } =
    useDashboardResponse(dashboardId);

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
            <DashboardItemView key={idx} dashboardItem={dashboardItem} />
          ))}
        </dl>
      )}
    </div>
  );
}

export default DashboardPage;

import { Widget as IWidget } from "@prisma/client";
import { useDashboardResponse } from "../hooks";
import { useDataSourceContext } from "@/hooks";
import { useGetWidgetsValuesQuery } from "../api-slice";
import React from "react";
import Widget from "./Widget";

function DashboardPage() {
  const { dashboardId } = useDataSourceContext();

  const { isLoading: dashboardIsLoading, widgets } =
    useDashboardResponse(dashboardId);

  useGetWidgetsValuesQuery({ dashboardId }, { skip: !dashboardId });

  // @todo:
  // @todo: No widgets found -> "No widgets" + link catre edit page cu label "Add a widget"
  // effect pe dashboardId sa re-rulesze hook-ul👆 (probabil cu lazy)

  return (
    <div className="relative flex flex-col flex-1 w-full h-full p-2">
      {!dashboardIsLoading && widgets.length === 0 && (
        <div className="flex flex-1 justify-center items-center text-lg font-semibold text-gray-600 h-full">
          No widgets found
        </div>
      )}
      {!dashboardIsLoading && widgets.length > 0 && (
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {widgets.map((widget: IWidget, idx: number) => (
            <Widget key={idx} widget={widget} />
          ))}
        </dl>
      )}
    </div>
  );
}

export default DashboardPage;

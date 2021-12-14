import { Widget } from "@prisma/client";
import { useDashboardResponse } from "../hooks";
import { useDataSourceContext } from "@/hooks";
import { useGetWidgetsValuesQuery } from "../api-slice";
import React, { useMemo } from "react";
import WidgetView from "./WidgetView";

function DashboardPage() {
  const { dashboardId } = useDataSourceContext();

  const { isLoading: dashboardIsLoading, widgets } =
    useDashboardResponse(dashboardId);

  const { data: widgetsValuesResponse, isLoading: widgetsValuesIsLoading } =
    useGetWidgetsValuesQuery({ dashboardId }, { skip: !dashboardId });

  const widgetsValues: any = useMemo(
    () =>
      widgetsValuesResponse?.ok &&
      Object.fromEntries(
        widgetsValuesResponse.data.map(
          (itemValue: { id: number; value?: string; error?: string }) => [
            itemValue.id,
            { value: itemValue.value, error: itemValue.error },
          ]
        )
      ),
    [widgetsValuesResponse]
  );

  return (
    <div className="relative flex flex-col flex-1 w-full h-full p-2">
      {!dashboardIsLoading && widgets.length === 0 && (
        <div className="flex flex-1 justify-center items-center text-lg font-semibold text-gray-600 h-full">
          No widgets found
        </div>
      )}
      {!dashboardIsLoading && widgets.length > 0 && (
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {widgets.map((widget: Widget, idx: number) => (
            <WidgetView
              key={idx}
              widget={widget}
              valueResponse={
                widgetsValues ? widgetsValues[widget.id] : undefined
              }
              isLoading={widgetsValuesIsLoading}
            />
          ))}
        </dl>
      )}
    </div>
  );
}

export default DashboardPage;

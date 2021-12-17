import { Widget as IWidget } from "@prisma/client";
import { Link } from "@chakra-ui/react";
import { setActiveWidgetId } from "@/features/records/state-slice";
import { sortBy } from "lodash";
import { useAppDispatch, useDataSourceContext } from "@/hooks";
import { useDashboardResponse } from "../hooks";
import { useGetWidgetsValuesQuery } from "../api-slice";
import Divider from "./Divider";
import React, { useEffect, useMemo } from "react";
import Widget from "./Widget";

function DashboardPage({ isEditPage = false }: { isEditPage?: boolean }) {
  const dispatch = useAppDispatch();
  const { dashboardId } = useDataSourceContext();

  const { isLoading: dashboardIsLoading, widgets } =
    useDashboardResponse(dashboardId);

  useGetWidgetsValuesQuery({ dashboardId }, { skip: !dashboardId });

  useEffect(() => {
    if (!isEditPage) dispatch(setActiveWidgetId(null));
  }, [isEditPage]);

  const orderedWidgets = useMemo(
    () => sortBy(widgets, [(widget: IWidget) => widget.order]),
    [widgets]
  );

  return (
    <div className="relative flex flex-col flex-1 w-full h-full p-2 bg-neutral-100">
      {!dashboardIsLoading && widgets.length === 0 && (
        <div className="flex flex-1 flex-col justify-center items-center text-lg font-semibold text-gray-600 h-full">
          No widgets{" "}
          {!isEditPage && (
            <Link href={`/dashboards/${dashboardId}/edit`}>
              <a className="text-blue-600 text-sm underline mr-1">
                Add a widget
              </a>
            </Link>
          )}
        </div>
      )}
      {!dashboardIsLoading && orderedWidgets.length > 0 && (
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {orderedWidgets.map((widget: IWidget, idx: number) => {
            if(widget.type === "metric") {
              return <Widget key={idx} widget={widget} />
            } else if (widget.type === "divider") {
              return <Divider key={idx} widget={widget} />
            }
          })}
        </dl>
      )}
    </div>
  );
}

export default DashboardPage;

import { Dashboard, Widget } from "@prisma/client";
import { activeWidgetNameSelector, setActiveWidgetName } from "./../records/state-slice";
import { dotNotationToObject } from "@/lib/helpers";
import { isUndefined } from "lodash";
import { useAppDispatch, useAppSelector, useDataSourceContext } from "@/hooks";
import {
  useGetDashboardQuery,
  useUpdateWidgetMutation,
} from "./api-slice";
import { useMemo } from "react";

export const useUpdateWidget = () => {
  const dispatch = useAppDispatch();
  const { dashboardId } = useDataSourceContext();
  const activeWidgetName = useAppSelector(activeWidgetNameSelector);
  const { widgets } = useDashboardResponse(dashboardId);

  const widget = useMemo(
    () =>
      widgets.find(
        (widget: Widget) =>
          widget.name === activeWidgetName
      ),
    [widgets, activeWidgetName]
  );

  const [updateWidgetOnServer] = useUpdateWidgetMutation();

  const setWidgetOptions = async (payload: Record<string, unknown>) => {
    if(!widget) return;

    const body = dotNotationToObject(payload);

    const response = await updateWidgetOnServer({
      widgetId: widget.id.toString(),
      body,
    }).unwrap();

    if (response?.ok && !isUndefined(body?.name)) {
      // select the renamed widget
      dispatch(setActiveWidgetName(body.name as string));
    }
  };

  return {
    widget,
    setWidgetOptions,
  };
};

export const useDashboardResponse = (dashboardId: string) => {
  const {
    data: response,
    isLoading,
    isFetching,
    error,
  } = useGetDashboardQuery({ dashboardId }, { skip: !dashboardId });

  const dashboard:
    | (Dashboard & {
        widgets: Widget[];
      })
    | undefined = useMemo(() => response?.ok && response.data, [response]);

  const widgets = useMemo(
    () => (dashboard ? dashboard?.widgets : []),
    [dashboard]
  );

  return {
    dashboard,
    response,
    isLoading,
    isFetching,
    error,
    widgets,
  };
};

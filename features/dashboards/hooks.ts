import { Dashboard, Widget } from "@prisma/client";
import { WidgetValue } from "./types";
import { activeWidgetNameSelector, setActiveWidgetName } from "./../records/state-slice";
import { dotNotationToObject } from "@/lib/helpers";
import { isEmpty, isUndefined } from "lodash";
import { useAppDispatch, useAppSelector, useDataSourceContext } from "@/hooks";
import { useEffect, useMemo, useState } from "react";
import {
  useGetDashboardQuery,
  useGetWidgetsValuesQuery,
  useLazyGetWidgetValueQuery,
  useUpdateWidgetMutation,
} from "./api-slice";

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

  const setWidgetOptions = async (id: number, payload: Record<string, unknown>) => {
    if(!id) return;

    const body = dotNotationToObject(payload);

    const response = await updateWidgetOnServer({
      widgetId: id.toString(),
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

export const useWidgetValue = (widget: Widget) => {
  const dashboardId = widget.dashboardId.toString();

  // Gets the widget values as bulk based on dashboardId
  const { data: bulkValuesResponse, isFetching: bulkValuesAreFetching } =
    useGetWidgetsValuesQuery({ dashboardId }, { skip: !dashboardId });

  // Method to get single value when refresh button is clicked based on widgetId
  const [
    getWidgetValue,
    { data: widgetValueResponse, isFetching: widgetValueIsFetching },
  ] = useLazyGetWidgetValueQuery();

  // The value retrieved from single refresh query.
  const widgetValueFromSingleRefresh = useMemo(
    () => (widgetValueResponse?.ok ? widgetValueResponse.data : {}),
    [widgetValueResponse]
  );

  // When either of the two fetching queries is run. We need it for the shimmer loading.
  const isFetching = useMemo(
    () => bulkValuesAreFetching || widgetValueIsFetching,
    [bulkValuesAreFetching, widgetValueIsFetching]
  );

  // The value of the current widget from the bulk query.
  const widgetValueFromBulk = useMemo(
    () =>
      bulkValuesResponse?.ok
        ? bulkValuesResponse.data.find(
            (bulkValue: WidgetValue) => bulkValue.id === widget.id
          )
        : {},
    [bulkValuesResponse, dashboardId, widget.id]
  );

  // The value of the widget. We have to keep it in state because it gets updated from two sides.
  const [widgetValue, setWidgetValue] = useState<WidgetValue>({
    id: widget.id,
  });

  // When the widget value is updated from the bulk query, we have to update also the state.
  useEffect(() => {
    if (!isEmpty(widgetValueFromBulk)) {
      setWidgetValue(widgetValueFromBulk);
    }
  }, [widgetValueFromBulk]);

  // When the widget value is updated from the single refresh query, we have to update also the state.
  useEffect(() => {
    if (!isEmpty(widgetValueFromSingleRefresh)) {
      setWidgetValue(widgetValueFromSingleRefresh);
    }
  }, [widgetValueFromSingleRefresh]);

  return {
    getWidgetValue,
    widgetValue,
    widgetValueIsFetching,
    isFetching,
  }
}

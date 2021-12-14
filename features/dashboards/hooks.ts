import { Dashboard, DashboardItem } from "@prisma/client";
import { activeWidgetNameSelector, setActiveWidgetName } from "./../records/state-slice";
import { dotNotationToObject } from "@/lib/helpers";
import { isUndefined } from "lodash";
import { useAppDispatch, useAppSelector, useDataSourceContext } from "@/hooks";
import {
  useGetDashboardQuery,
  useUpdateDashboardItemMutation,
} from "./api-slice";
import { useMemo } from "react";

export const useUpdateWidget = () => {
  const dispatch = useAppDispatch();
  const { dashboardId } = useDataSourceContext();
  const activeWidgetName = useAppSelector(activeWidgetNameSelector);
  const { dashboardItems } = useDashboardResponse(dashboardId);

  const widget = useMemo(
    () =>
      dashboardItems.find(
        (dashboardItem: DashboardItem) =>
          dashboardItem.name === activeWidgetName
      ),
    [dashboardItems, activeWidgetName]
  );

  const [updateWidgetOnServer] = useUpdateDashboardItemMutation();

  const setWidgetOptions = async (payload: Record<string, unknown>) => {
    if(!widget) return;

    const body = dotNotationToObject(payload);

    const response = await updateWidgetOnServer({
      dashboardItemId: widget.id.toString(),
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
        dashboardItems: DashboardItem[];
      })
    | undefined = useMemo(() => response?.ok && response.data, [response]);

  const dashboardItems = useMemo(
    () => (dashboard ? dashboard?.dashboardItems : []),
    [dashboard]
  );

  return {
    dashboard,
    response,
    isLoading,
    isFetching,
    error,
    dashboardItems,
  };
};

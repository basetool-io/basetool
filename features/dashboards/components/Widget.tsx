import { IconButton, Tooltip } from "@chakra-ui/react";
import { InformationCircleIcon, RefreshIcon } from "@heroicons/react/outline";
import { Widget } from "@prisma/client";
import { WidgetValueResponse } from "../types";
import {
  activeWidgetNameSelector,
  setActiveWidgetName,
} from "@/features/records/state-slice";
import { isUndefined, isEmpty } from "lodash";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  useGetWidgetsValuesQuery,
  useLazyGetWidgetValueQuery,
} from "../api-slice";
import { useRouter } from "next/router";
import React, { memo, useEffect, useMemo, useState } from "react";
import Shimmer from "@/components/Shimmer";
import classNames from "classnames";

function Widget({ widget }: { widget: Widget }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const activeWidgetName = useAppSelector(activeWidgetNameSelector);
  const dashboardId = widget.dashboardId.toString();
  console.log("dashboardId->", dashboardId);

  const { data: bulkValues, isFetching: bulkValuesAreFetching } =
    useGetWidgetsValuesQuery({ dashboardId }, { skip: !dashboardId });

  const [
    getWidgetValue,
    { data: widgetResponse, isFetching: widgetValueIsFetching },
  ] = useLazyGetWidgetValueQuery();

  const responseData = useMemo(
    () => (widgetResponse?.ok ? widgetResponse.data : {}),
    [widgetResponse]
  );

  const isFetching = bulkValuesAreFetching || widgetValueIsFetching;

  const widgetStateFromBulk = useMemo(() => {
    console.log("bulkValues->", bulkValues);

    const t = bulkValues?.ok
      ? bulkValues.data.find(({ id }) => id === widget.id)
      : {};
    console.log("t->", t);

    return t;
  }, [bulkValues, dashboardId, widget.id]);

  const [widgetState, setWidgetState] = useState<WidgetValueResponse>({});

  useEffect(() => {
    if (!isEmpty(widgetStateFromBulk)) setWidgetState(widgetStateFromBulk);
    console.log("1->", 1, widgetStateFromBulk);
  }, [widgetStateFromBulk]);

  useEffect(() => {
    if (!isEmpty(responseData)) {
      console.log(222)
      setWidgetState(responseData);}
    console.log("2->", 2, responseData);
  }, [responseData]);

  const isEditPage = useMemo(
    () => router.pathname.includes("/edit"),
    [router.pathname]
  );
  const widgetIsActive = useMemo(
    () => activeWidgetName === widget.name && isEditPage,
    [activeWidgetName, widget.name, isEditPage]
  );

  const toggleWidgetSelection = () => {
    if (isEditPage) {
      if (activeWidgetName === widget?.name) {
        dispatch(setActiveWidgetName(""));
      } else {
        dispatch(setActiveWidgetName(widget.name));
      }
    }
  };

  const hasError = useMemo(
    () => responseData.id && !isUndefined(responseData?.error),
    [responseData]
  );

  const refreshValue = async (e: any) => {
    e.stopPropagation();

    if (!widget) return;

    await getWidgetValue({
      widgetId: widget.id.toString(),
    });
  };

  return (
    <div
      className={classNames(
        "flex flex-col justify-between px-3 py-4 bg-white shadow rounded-lg overflow-hidden sm:p-6",
        {
          "border border-blue-600": widgetIsActive,
        }
      )}
      onClick={toggleWidgetSelection}
    >
      <pre>{JSON.stringify([widgetStateFromBulk, widgetState], null, 2)}</pre>
      <dt className="flex justify-between w-full text-sm font-medium text-gray-500 truncate">
        <span>{widget.name}</span>
        <IconButton
          size="xs"
          variant="ghost"
          aria-label="Refresh"
          icon={<RefreshIcon className="h-3" />}
          onClick={refreshValue}
          isFetching={widgetValueIsFetching}
        />
      </dt>
      {isFetching && (
        // Extract <LoadingState
        <dd className="mt-1 text-3xl font-semibold text-gray-900">
          <Shimmer height="36px" width="200px" className="inline-block" />
        </dd>
      )}
      {!isFetching && (
        <dd className="mt-1 text-3xl text-gray-900 leading-9">
          {hasError && (
            // extract <ErrorState widgetState={widgetState} />
            <div className="relative flex text-red-500 items-center">
              <label className="text-sm font-semibold flex uppercase text-gray-500">
                Error
              </label>
              <div>
                <Tooltip placement="bottom" label={widgetState.error}>
                  <div>
                    <InformationCircleIcon className="block h-4 ml-1" />
                  </div>
                </Tooltip>
              </div>
            </div>
          )}
          {!hasError && (
            // extract <SuccessState />
            <>
              <span className="mr-1">{widget.options.prefix}</span>
              <span className="font-semibold">{widgetState.value}</span>
              <span className="ml-1 text-base text-gray-700">
                {widget.options.suffix}
              </span>
            </>
          )}
        </dd>
      )}
    </div>
  );
}

export default memo(Widget);

import { IconButton, Tooltip } from "@chakra-ui/react";
import { InformationCircleIcon, RefreshIcon } from "@heroicons/react/outline";
import { Widget } from "@prisma/client";
import { WidgetOptions, WidgetValueResponse } from "../types";
import {
  activeWidgetNameSelector,
  setActiveWidgetName,
} from "@/features/records/state-slice";
import { isEmpty, isUndefined } from "lodash";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  useGetWidgetsValuesQuery,
  useLazyGetWidgetValueQuery,
} from "../api-slice";
import { useRouter } from "next/router";
import React, { memo, useEffect, useMemo, useState } from "react";
import Shimmer from "@/components/Shimmer";
import classNames from "classnames";

const LoadingState = () => (
  <dd className="mt-1 text-3xl font-semibold text-gray-900">
    <Shimmer height="36px" className="inline-block" />
  </dd>
);

const ErrorState = ({ widgetValue }: { widgetValue: WidgetValueResponse }) => (
  <div className="relative flex text-red-500 items-center">
    <label className="text-sm font-semibold flex uppercase text-gray-500">
      Error
    </label>
    <div>
      <Tooltip placement="bottom" label={widgetValue.error}>
        <div>
          <InformationCircleIcon className="block h-4 ml-1" />
        </div>
      </Tooltip>
    </div>
  </div>
);

const SuccessState = ({
  widget,
  widgetValue,
}: {
  widget: Widget;
  widgetValue: WidgetValueResponse;
}) => (
  <>
    <span className="mr-1">{(widget?.options as WidgetOptions)?.prefix}</span>
    <span className="font-semibold">{widgetValue.value}</span>
    <span className="ml-1 text-base text-gray-700">
      {(widget?.options as WidgetOptions)?.suffix}
    </span>
  </>
);

function Widget({ widget }: { widget: Widget }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const activeWidgetName = useAppSelector(activeWidgetNameSelector);
  const dashboardId = widget.dashboardId.toString();

  const { data: bulkValuesResponse, isFetching: bulkValuesAreFetching } =
    useGetWidgetsValuesQuery({ dashboardId }, { skip: !dashboardId });

  const [
    getWidgetValue,
    { data: widgetValueResponse, isFetching: widgetValueIsFetching },
  ] = useLazyGetWidgetValueQuery();

  const widgetValueFromSingleRefresh = useMemo(
    () => (widgetValueResponse?.ok ? widgetValueResponse.data : {}),
    [widgetValueResponse]
  );

  const isFetching = useMemo(
    () => bulkValuesAreFetching || widgetValueIsFetching,
    [bulkValuesAreFetching, widgetValueIsFetching]
  );

  const widgetValueFromBulk = useMemo(
    () =>
      bulkValuesResponse?.ok
        ? bulkValuesResponse.data.find(
            (bulkValue: WidgetValueResponse) => bulkValue.id === widget.id
          )
        : {},
    [bulkValuesResponse, dashboardId, widget.id]
  );

  const [widgetValue, setWidgetValue] = useState<WidgetValueResponse>({
    id: widget.id,
  });

  useEffect(() => {
    if (!isEmpty(widgetValueFromBulk)) {
      setWidgetValue(widgetValueFromBulk);
    }
  }, [widgetValueFromBulk]);

  useEffect(() => {
    if (!isEmpty(widgetValueFromSingleRefresh)) {
      setWidgetValue(widgetValueFromSingleRefresh);
    }
  }, [widgetValueFromSingleRefresh]);

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
    () => widgetValue.id && !isUndefined(widgetValue?.error),
    [widgetValue]
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
      <dt className="flex justify-between w-full text-sm font-medium text-gray-500 truncate mb-1">
        <span>{widget.name}</span>
        <IconButton
          size="xs"
          variant="ghost"
          aria-label="Refresh"
          icon={<RefreshIcon className="h-3" />}
          onClick={refreshValue}
          isFetching={widgetValueIsFetching}
          className="no-focus"
        />
      </dt>
      {isFetching && <LoadingState />}
      {!isFetching && (
        <dd className="text-3xl text-gray-900 leading-9">
          {hasError && <ErrorState widgetValue={widgetValue} />}
          {!hasError && (
            <SuccessState widget={widget} widgetValue={widgetValue} />
          )}
        </dd>
      )}
    </div>
  );
}

export default memo(Widget);

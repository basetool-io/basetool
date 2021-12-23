import { IconButton, Tooltip } from "@chakra-ui/react";
import { InformationCircleIcon, RefreshIcon } from "@heroicons/react/outline";
import { Widget } from "@prisma/client";
import { WidgetOptions, WidgetValue } from "../types";
import { activeWidgetIdSelector } from "@/features/records/state-slice";
import { isUndefined } from "lodash";
import { useAppSelector } from "@/hooks";
import { useWidgetValue } from "../hooks";
import React, { memo, useMemo } from "react";
import Shimmer from "@/components/Shimmer";
import classNames from "classnames";
import numeral from "numeral";

const LoadingState = () => (
  <dd className="text-3xl font-semibold text-gray-900">
    <Shimmer height="100%" className="inline-block" />
  </dd>
);

const ErrorState = memo(({ widgetValue }: { widgetValue: WidgetValue }) => (
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
));
ErrorState.displayName = "ErrorState";

const SuccessState = memo(
  ({ widget, widgetValue }: { widget: Widget; widgetValue: WidgetValue }) => {
    // We have to check whether the value is a number before formatting it.
    const value = isNaN(Number(widgetValue.value)) ? widgetValue.value : numeral(widgetValue.value).format("0[.]00a");

    return (
      <>
        <span className="mr-1">
          {(widget?.options as WidgetOptions)?.prefix}
        </span>
        <span className="font-semibold">{value}</span>
        <span className="ml-1 text-base text-gray-700">
          {(widget?.options as WidgetOptions)?.suffix}
        </span>
      </>
    );
  }
);
SuccessState.displayName = "SuccessState";

function Widget({ widget }: { widget: Widget }) {
  const activeWidgetId = useAppSelector(activeWidgetIdSelector);

  const { getWidgetValue, widgetValue, isFetching, widgetValueIsFetching } =
    useWidgetValue(widget);

  const widgetIsActive = useMemo(
    () => activeWidgetId === widget.id,
    [activeWidgetId, widget.id]
  );

  const hasError = useMemo(
    () => widgetValue.id && !isUndefined(widgetValue?.error),
    [widgetValue]
  );

  const refreshValue = async () => {
    if (!widget) return;

    await getWidgetValue({
      widgetId: widget.id.toString(),
    });
  };

  return (
    <div
      className={classNames(
        "flex flex-col justify-between px-3 py-4 bg-white shadow rounded-lg overflow-hidden sm:p-6 border border-transparent",
        {
          "border-blue-600": widgetIsActive,
        }
      )}
    >
      <dt className="flex justify-between w-full text-sm font-medium text-gray-500 truncate mb-1">
        <span>{widget.name}</span>
        <IconButton
          size="xs"
          variant="ghost"
          aria-label="Refresh"
          icon={<RefreshIcon className="h-3" />}
          onClick={refreshValue}
          isLoading={widgetValueIsFetching}
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

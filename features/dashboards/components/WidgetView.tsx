import { IconButton, Tooltip } from "@chakra-ui/react";
import { InformationCircleIcon, RefreshIcon } from "@heroicons/react/outline";
import { Widget } from "@prisma/client";
import {
  activeWidgetNameSelector,
  setActiveWidgetName,
} from "@/features/records/state-slice";
import { isUndefined } from "lodash";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { useGetWidgetValueMutation } from "../api-slice";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import Shimmer from "@/components/Shimmer";
import classNames from "classnames";

export type WidgetOptions = {
  prefix: string;
  suffix: string;
};

function WidgetView({
  widget,
  isLoading = false,
  valueResponse,
}: {
  widget: Widget;
  isLoading: boolean;
  valueResponse:
    | {
        value?: string;
        error?: string;
      }
    | undefined;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const activeWidgetName = useAppSelector(activeWidgetNameSelector);

  const [displayValue, setDisplayValue] = useState<number | undefined>();
  const [valueErrorMessage, setValueErrorMessage] = useState<
    string | undefined
  >();
  const hasValueError = useMemo(
    () => !isUndefined(valueErrorMessage),
    [valueErrorMessage]
  );

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

  const options = useMemo(
    () => widget?.options as WidgetOptions,
    [widget.options]
  );

  const prefix = useMemo(() => options.prefix || "", [options]);
  const suffix = useMemo(() => options.suffix || "", [options]);

  useEffect(() => {
    setDisplayValue(parseFloat(valueResponse?.value || ""));
    setValueErrorMessage(valueResponse?.error);
  }, [valueResponse]);

  const [getWidgetValue, { isLoading: widgetValueIsLoading }] =
    useGetWidgetValueMutation();

  const refreshValue = async (e: any) => {
    e.stopPropagation();

    if (!widget) return;

    const response = await getWidgetValue({
      widgetId: widget.id.toString(),
    }).unwrap();

    if (response?.ok) {
      if (response?.data?.value)
        setDisplayValue(parseFloat(response.data.value));
      if (response?.data?.error) setValueErrorMessage(response.data.error);
    }
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
      <dt className="flex justify-between w-full text-sm font-medium text-gray-500 truncate">
        <span>{widget.name}</span>
        <IconButton
          size="xs"
          variant="ghost"
          aria-label="Refresh"
          icon={<RefreshIcon className="h-3" />}
          onClick={refreshValue}
          isLoading={widgetValueIsLoading}
        />
      </dt>
      {(isLoading || widgetValueIsLoading) && (
        <dd className="mt-1 text-3xl font-semibold text-gray-900">
          <Shimmer height="36px" width="200px" className="inline-block" />
        </dd>
      )}
      {!(isLoading || widgetValueIsLoading) && (
        <dd className="mt-1 text-3xl text-gray-900 leading-9">
          {hasValueError && (
            <div className="relative flex text-red-500 items-center">
              <label className="text-sm font-semibold flex uppercase text-gray-500">
                Error
              </label>
              <div>
                <Tooltip placement="bottom" label={valueErrorMessage}>
                  <div>
                    <InformationCircleIcon className="block h-4 ml-1" />
                  </div>
                </Tooltip>
              </div>
            </div>
          )}
          {!hasValueError && (
            <>
              <span className="mr-1">{prefix}</span>
              <span className="font-semibold">{displayValue}</span>
              <span className="ml-1 text-base text-gray-700">{suffix}</span>
            </>
          )}
        </dd>
      )}
    </div>
  );
}

export default WidgetView;

import { InformationCircleIcon } from "@heroicons/react/outline";
import { Tooltip } from "@chakra-ui/react";
import { Widget } from "@prisma/client";
import {
  activeWidgetNameSelector,
  setActiveWidgetName,
} from "@/features/records/state-slice";
import { isUndefined } from "lodash";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { useRouter } from "next/router";
import React, { useMemo } from "react";
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

  const isEditPage = useMemo(
    () => router.pathname.includes("/edit"),
    [router.pathname]
  );
  const widgetIsActive = useMemo(
    () => activeWidgetName === widget.name && isEditPage,
    [activeWidgetName, widget.name, isEditPage]
  );

  const selectActiveWidget = () => {
    if (isEditPage) {
      dispatch(setActiveWidgetName(widget.name));
    }
  };

  const options = useMemo(
    () => widget?.options as WidgetOptions,
    [widget.options]
  );

  const prefix = useMemo(() => options.prefix || "", [options]);
  const suffix = useMemo(() => options.suffix || "", [options]);

  const valueErrorMessage = useMemo(
    () => (valueResponse ? valueResponse?.error : undefined),
    [valueResponse]
  );
  const hasValueError = useMemo(
    () => !isUndefined(valueErrorMessage),
    [valueErrorMessage]
  );
  const displayValue = useMemo(
    () => parseFloat(valueResponse?.value || ""),
    [valueResponse]
  );

  return (
    <div
      className={classNames(
        "px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6",
        {
          "border border-blue-600": widgetIsActive,
        }
      )}
      onClick={selectActiveWidget}
    >
      <dt className="text-sm font-medium text-gray-500 truncate">
        {widget.name}
      </dt>
      {isLoading && (
        <dd className="mt-1 text-3xl font-semibold text-gray-900">
          <Shimmer height="36px" width="200px" className="inline-block" />
        </dd>
      )}
      {!isLoading && (
        <dd className="mt-1 text-3xl text-gray-900 leading-9">
          {hasValueError && (
            <div className="relative flex mb-1 text-red-500">
              <label className="text-lg font-semibold flex uppercase">
                Error occurred
              </label>
              <div>
                <Tooltip placement="bottom" label={valueErrorMessage}>
                  <div>
                    <InformationCircleIcon className="block h-4" />
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

import { Widget } from "@prisma/client";
import { activeWidgetIdSelector } from "@/features/records/state-slice";
import { useAppSelector } from "@/hooks";
import React, { memo, useMemo } from "react";
import classNames from "classnames";


function Divider({ widget }: { widget: Widget }) {
  const activeWidgetId = useAppSelector(activeWidgetIdSelector);

  const widgetIsActive = useMemo(
    () => activeWidgetId === widget.id,
    [activeWidgetId, widget.id]
  );

  return (
    <div
      className={classNames(
        "flex flex-col w-full p-1 -mb-4 mt-2 overflow-hidden border border-transparent col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-5",
        {
          "border-blue-600": widgetIsActive,
        }
      )}
    >
      <span className="uppercase text-sm text-gray-500">{widget.name}</span>
    </div>
  );
}

export default memo(Divider);

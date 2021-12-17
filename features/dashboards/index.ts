import { ElementType } from "react";
import { MinusIcon, VariableIcon } from "@heroicons/react/outline";
import { Widget } from "@prisma/client";

export const iconForWidget = (widget: Widget): ElementType => {
  switch (widget.type) {
    default:
    case "metric":
      return VariableIcon;
    case "divider":
      return MinusIcon;
  }
};

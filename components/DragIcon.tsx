import { DotsVerticalIcon } from "@heroicons/react/outline";
import React from "react";
import classNames from "classnames";

function DragIcon({ className }: { className?: string }) {
  return (
    <div
      className={classNames(
        "flex h-4 cursor-grab",
        className
      )}
    >
      <DotsVerticalIcon className={classNames("flex flex-shrink-0 -ml-1 -mr-3 ")} />
      <DotsVerticalIcon className={classNames("flex flex-shrink-0 -mr-1")} />
    </div>
  );
}

export default DragIcon;

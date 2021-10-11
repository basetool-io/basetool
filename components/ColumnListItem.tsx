import { ItemTypes } from "@/lib/ItemTypes";
import { MenuIcon } from "@heroicons/react/outline";
import { isUndefined } from "lodash";
import { useDrag, useDrop } from "react-dnd";
import Link from "next/link";
import React, { ReactNode, memo } from "react";
import classNames from "classnames";

const ColumnListItem = ({
  active,
  icon,
  onClick,
  children,
  href,
  reordering = false,
  id,
  moveColumn,
  findColumn,
}: {
  active: boolean;
  icon?: ReactNode;
  onClick?: () => void;
  children: ReactNode;
  href?: string;
  reordering?: boolean;
  id?: number;
  moveColumn?: (id: number, to: number) => void;
  findColumn?: (id: number) => { index: number };
}) => {
  const originalIndex =
    !isUndefined(findColumn) && !isUndefined(id) ? findColumn(id).index : 0;
  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: ItemTypes.COLUMN,
      item: { id, originalIndex },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: (item, monitor) => {
        const { id: droppedId, originalIndex } = item;
        const didDrop = monitor.didDrop();
        if (!didDrop && !isUndefined(moveColumn) && !isUndefined(droppedId)) {
          moveColumn(droppedId, originalIndex);
        }
      },
    }),
    [id, originalIndex, moveColumn]
  );

  const [, drop] = useDrop(
    () => ({
      accept: ItemTypes.COLUMN,
      canDrop: () => false,
      hover({ id: draggedId }: { id: number }) {
        if (
          draggedId !== id &&
          !isUndefined(moveColumn) &&
          !isUndefined(findColumn) &&
          !isUndefined(id)
        ) {
          const { index: overIndex } = findColumn(id);
          moveColumn(draggedId, overIndex);
        }
      },
    }),
    [findColumn, moveColumn]
  );

  const Component = (
    <div
      className={classNames(
        "w-full cursor-pointer uppercase text-sm font-semibold rounded flex items-center p-1 overflow-hidden",
        {
          "bg-blue-500 text-white": active,
        },
        { "bg-gray-800 opacity-25": isDragging }
      )}
      onClick={() => (onClick ? onClick() : "")}
      ref={preview}
    >
      <div className="flex justify-between w-full">
        <span className="flex">
          {icon} <span>{children}</span>
        </span>
        {reordering && (
          <span ref={(node) => drag(drop(node))}>
            <MenuIcon className="h-4 text-gray-300 hover:text-gray-500 cursor-move" />
          </span>
        )}
      </div>
    </div>
  );

  if (href) return <Link href={href}>{Component}</Link>;

  return Component;
};

export default memo(ColumnListItem);

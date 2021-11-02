import { EyeOffIcon, MenuIcon } from "@heroicons/react/outline";
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
  itemType = "column",
  reordering = false,
  id,
  moveMethod,
  findMethod,
  hidden = false,
}: {
  active: boolean;
  icon?: ReactNode;
  onClick?: () => void;
  children: ReactNode;
  href?: string;
  itemType?: string;
  reordering?: boolean;
  id?: number;
  moveMethod?: (id: number, to: number) => void;
  findMethod?: (id: number) => { index: number };
  hidden?: boolean;
}) => {
  const originalIndex =
    !isUndefined(findMethod) && !isUndefined(id) ? findMethod(id).index : 0;
  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: itemType as string,
      item: { id, originalIndex },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: (item, monitor) => {
        const { id: droppedId, originalIndex } = item;
        const didDrop = monitor.didDrop();
        if (!didDrop && !isUndefined(moveMethod) && !isUndefined(droppedId)) {
          moveMethod(droppedId, originalIndex);
        }
      },
    }),
    [id, originalIndex, moveMethod]
  );

  const [, drop] = useDrop(
    () => ({
      accept: itemType as string,
      canDrop: () => false,
      hover({ id: draggedId }: { id: number }) {
        if (
          draggedId !== id &&
          !isUndefined(moveMethod) &&
          !isUndefined(findMethod) &&
          !isUndefined(id)
        ) {
          const { index: overIndex } = findMethod(id);
          moveMethod(draggedId, overIndex);
        }
      },
    }),
    [findMethod, moveMethod]
  );

  const Component = (
    <div
      className={classNames(
        "w-full cursor-pointer uppercase text-sm font-semibold rounded flex items-center p-1 overflow-hidden",
        {
          "bg-blue-600 text-white": active,
        },
        { "bg-gray-800 opacity-25": isDragging }
      )}
      onClick={() => (onClick ? onClick() : "")}
      ref={preview}
    >
      <div className="flex justify-between w-full items-center">
        <span className={`flex justify-center items-center ${hidden && !active ? "text-gray-600" : ""}`}>
          {icon} <span>{children}</span> {hidden && (
            <EyeOffIcon className="h-4 ml-1 inline" />
        )}
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

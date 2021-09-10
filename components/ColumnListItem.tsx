import React, { ReactNode, memo } from "react";
import classNames from "classnames";

const ColumnListItem = ({
  active,
  icon,
  onClick,
  children
}: {
  active: boolean;
  icon?: ReactNode;
  onClick: () => void;
  children: ReactNode
}) => {
  return (
    <div
      className={classNames(
        "w-full cursor-pointer uppercase text-sm font-semibold rounded flex items-center p-1",
        {
          "bg-blue-500 text-white": active,
        }
      )}
      onClick={() => onClick()}
    >
      {icon} <span>{children}</span>
    </div>
  );
};

export default memo(ColumnListItem);

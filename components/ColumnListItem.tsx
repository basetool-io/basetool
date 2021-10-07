import Link from "next/link";
import React, { ReactNode, memo } from "react";
import classNames from "classnames";

const ColumnListItem = ({
  active,
  icon,
  onClick,
  children,
  href,
}: {
  active: boolean;
  icon?: ReactNode;
  onClick?: () => void;
  children: ReactNode;
  href?: string;
}) => {
  const Component = (
    <div
      className={classNames(
        "w-full cursor-pointer uppercase text-sm font-semibold rounded flex items-center p-1 overflow-hidden",
        {
          "bg-blue-500 text-white": active,
        }
      )}
      onClick={() => (onClick ? onClick() : "")}
    >
      {icon} <span>{children}</span>
    </div>
  );

  if (href) return <Link href={href}>{Component}</Link>;

  return Component;
};

export default memo(ColumnListItem);

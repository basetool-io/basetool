import Link from "next/link";
import React, { memo } from "react";
import classNames from "classnames";

function SidebarItem({
  active,
  label,
  link,
  ...rest
}: {
  active?: boolean;
  label: string;
  link: string;
  onClick?: () => void;
  [name: string]: any;
}) {
  return (
    <Link href={link} passHref>
      <a
        className={classNames(
          "overflow-hidden overflow-ellipsis w-full relative flex flex-grow-0 text-gray-800 font-normal cursor-pointer text-sm py-2 px-2 leading-none m-0 rounded-lg",
          { "text-gray-800": !active },
          { "bg-true-gray-300 hover:bg-true-gray-300": active }
        )}
        {...rest}
      >
        {label}
      </a>
    </Link>
  );
}

export default memo(SidebarItem);

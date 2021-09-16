import Link from "next/link";
import React from "react";
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
  [name: string]: any
}) {
  return (
    <Link href={link} passHref>
      <a
        className={classNames(
          "hover:bg-blue-gray-50 hover:shadow overflow-hidden overflow-ellipsis w-full relative flex flex-grow-0 text-gray-800 font-normal cursor-pointer text-sm py-2 px-4 rounded-md leading-none m-0",
          { "bg-white shadow": active }
        )}
        {...rest}
      >
        {label}
      </a>
    </Link>
  );
}

export default SidebarItem;

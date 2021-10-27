import { StarIcon } from "@heroicons/react/solid";
import { useFavourites } from "@/hooks";
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
  const { addFavourite, removeFavourite, isFavourite } = useFavourites();

  return (
    <div
      className={classNames(
        "hover:bg-blue-gray-50 hover:shadow overflow-hidden overflow-ellipsis w-full relative flex flex-grow-0 text-gray-800 font-normal cursor-pointer text-sm p-2 rounded-md leading-none group",
        { "bg-white shadow": active }
      )}
      {...rest}
    >
      <div className="flex justify-between w-full">
        <Link href={link} passHref>
          <a className="w-full">{label}</a>
        </Link>

        <div className="hidden group-hover:block">
          <StarIcon
            className={`h-3 ${
              isFavourite(link)
                ? "text-yellow-300 hover:text-yellow-400"
                : "text-gray-300 hover:text-gray-400"
            }`}
            onClick={() =>
              isFavourite(link)
                ? removeFavourite(link)
                : addFavourite(label, link)
            }
          />
        </div>
      </div>
    </div>
  );
}

export default memo(SidebarItem);

import { ArrowRightIcon } from "@heroicons/react/outline";
import { Tooltip } from "@chakra-ui/react";
import Link from "next/link";
import React, { memo } from "react";

function GoToRecord({
  href,
  label = "Go to record",
}: {
  href: string;
  label?: string;
}) {
  return (
    <Link href={href}>
      <a title={label}>
        <Tooltip label={label}>
          <span className="inline-flex">
            <ArrowRightIcon className="inline-block underline text-blue-600 cursor-pointer ml-1 h-4 pt-1" />
          </span>
        </Tooltip>
      </a>
    </Link>
  );
}

export default memo(GoToRecord);

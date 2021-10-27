import { Button, Tooltip } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/outline";
import { useOffsetPagination } from "@/features/records/hooks";
import Link from "next/link";
import React, { memo } from "react";

const CursorPagination = () => {
  const { previousPageLink, nextPageLink, canNextPage, canPreviousPage } =
    useOffsetPagination();

  return (
    <nav
      className="bg-white px-4 py-3 flex items-center justify-evenly border-t border-gray-200 sm:px-6 rounded-b"
      aria-label="Pagination"
    >
      <div className="flex-1 flex justify-start"></div>
      <div>
        <div className="flex justify-between sm:justify-end space-x-4">
          <Tooltip
            title={canPreviousPage ? "Load more records" : "No more records"}
          >
            <Link href={previousPageLink} passHref>
              <Button
                as="a"
                size="sm"
                isDisabled={!canPreviousPage}
                onClick={(e) => !canPreviousPage && e.preventDefault()}
              >
                <ChevronLeftIcon className="h-4 text-gray-600" />
              </Button>
            </Link>
          </Tooltip>
          <Tooltip
            title={canNextPage ? "Load more records" : "No more records"}
          >
            <Link href={nextPageLink} passHref>
              <Button
                as="a"
                size="sm"
                isDisabled={!canNextPage}
                onClick={(e) => !canNextPage && e.preventDefault()}
              >
                <ChevronRightIcon className="h-4 text-gray-600" />
              </Button>
            </Link>
          </Tooltip>
        </div>
      </div>
      <div className="flex-1 flex justify-end"></div>
    </nav>
  );
};

export default memo(CursorPagination);

import { Button } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/outline";
import { usePagination } from "@/features/records/hooks";
import React, { memo, useMemo } from "react";
import numeral from "numeral";

const OffsetPagination = () => {
  const {
    page,
    perPage,
    offset,
    nextPage,
    previousPage,
    maxPages,
    canPreviousPage,
    canNextPage,
    recordsCount,
  } = usePagination();

  const maxRecords = useMemo(
    () =>
      recordsCount && recordsCount < perPage ? recordsCount : perPage * page,
    [perPage, page, recordsCount]
  );

  return (
    <nav
      className="bg-white px-4 py-3 flex items-center justify-evenly border-t border-gray-200 sm:px-6 rounded-b"
      aria-label="Pagination"
    >
      <div className="flex-1 flex justify-start">
        <div className="inline-block text-gray-500 text-sm">
          Showing {offset + 1}-{maxRecords} {recordsCount && "of "}
          {recordsCount
            ? `${
                recordsCount < 1000
                  ? recordsCount
                  : numeral(recordsCount).format("0.0a")
              } in total`
            : ""}
        </div>
      </div>
      <div>
        <div className="flex justify-between sm:justify-end">
          <Button
            size="sm"
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
          >
            <ChevronLeftIcon className="h-4 text-gray-600" />
          </Button>
          <div className="flex items-center px-2 space-x-1">
            <span className="text-gray-500 mr-1">page</span> {page}{" "}
            <span className="pl-1">
              of {maxPages < 1000 ? maxPages : numeral(maxPages).format("0.0a")}
            </span>
          </div>
          <Button size="sm" onClick={() => nextPage()} disabled={!canNextPage}>
            <ChevronRightIcon className="h-4 text-gray-600" />
          </Button>
        </div>
      </div>
      <div className="flex-1 flex justify-end"></div>
    </nav>
  );
};

export default memo(OffsetPagination);

import { usePagination } from "@/features/records/hooks";
import OffsetPaginationComponent from "./OffsetPaginationComponent";
import React, { memo } from "react";

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

  return (
    <OffsetPaginationComponent
      page={page}
      perPage={perPage}
      offset={offset}
      nextPage={nextPage}
      previousPage={previousPage}
      maxPages={maxPages}
      canPreviousPage={canPreviousPage}
      canNextPage={canNextPage}
      recordsCount={recordsCount}
    />
  );
};

export default memo(OffsetPagination);

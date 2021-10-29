import { OrderDirection } from "../types";
import { isEmpty } from "lodash";
import {
  useColumns,
  useFilters,
  useOrderRecords,
  usePagination,
  useRecords,
  useResetState,
} from "@/features/records/hooks";
import { useDataSourceContext } from "@/hooks";
import { useGetColumnsQuery } from "../api-slice";
import { useGetDataSourceQuery } from "@/features/data-sources/api-slice";
import { useGetRecordsQuery } from "@/features/records/api-slice";
import { useRouter } from "next/router";
import CursorPagination from "./CursorPagination";
import LoadingOverlay from "@/components/LoadingOverlay";
import OffsetPagination from "./OffsetPagination";
import React, { memo, useEffect, useMemo } from "react";
import TheTable from "./TheTable";

const RecordsTable = () => {
  const router = useRouter();
  const resetRecordsState = useResetState();
  // @todo: Get filters from the URL param
  const { encodedFilters } = useFilters();
  const { dataSourceId, tableName, viewId } = useDataSourceContext();
  const { data: dataSourceResponse } = useGetDataSourceQuery(
    { dataSourceId },
    {
      skip: !dataSourceId,
    }
  );

  const { orderBy, orderDirection } = useOrderRecords(
    router.query.orderBy as string,
    router.query.orderDirection as OrderDirection
  );
  const { limit, offset } = usePagination();

  const {
    data: recordsResponse,
    error: recordsError,
    isLoading,
    isFetching,
  } = useGetRecordsQuery(
    {
      dataSourceId,
      tableName,
      filters: encodedFilters,
      limit: limit.toString(),
      offset: offset.toString(),
      orderBy: orderBy,
      orderDirection: orderDirection,
      // startingAfter: router.query.startingAfter as string,
      // endingBefore: router.query.endingBefore as string,
    },
    { skip: !dataSourceId }
  );

  const { data: columnsResponse } = useGetColumnsQuery(
    {
      dataSourceId,
      tableName,
    },
    {
      skip:
        !dataSourceId ||
        !tableName ||
        !dataSourceResponse?.meta?.dataSourceInfo?.supports?.columnsRequest,
    }
  );

  const { records } = useRecords(recordsResponse?.data, recordsResponse?.meta);
  useColumns({
    dataSourceResponse,
    dataResponse: recordsResponse,
    columnsResponse,
    tableName,
  });

  const hasRecords = useMemo(() => records.length > 0, [records]);
  const tableIsVisible = useMemo(() => {
    return !isLoading && hasRecords;
  }, [isLoading, hasRecords]);

  // Reset data store on dismount.
  useEffect(() => {
    return () => {
      resetRecordsState();
    };
  }, []);

  // Reset data store on table or view change.
  useEffect(() => {
    return () => {
      resetRecordsState();
    };
  }, [tableName, viewId]);

  const PaginationComponent = useMemo(() => {
    switch (dataSourceResponse?.meta?.dataSourceInfo?.pagination) {
      default:
      case "offset":
        return OffsetPagination;
      case "cursor":
        return CursorPagination;
    }
  }, [dataSourceResponse?.meta?.dataSourceInfo?.pagination]);

  return (
    <div className="relative flex flex-col justify-between h-full w-full">
      {isFetching && (
        <LoadingOverlay transparent={isEmpty(recordsResponse?.data)} />
      )}
      {recordsError && <div>Error: {JSON.stringify(recordsError)}</div>}
      {tableIsVisible && <TheTable />}
      {tableIsVisible || (
        <>
          {!isFetching && !hasRecords && (
            <div className="flex flex-1 justify-center items-center text-lg font-semibold text-gray-600">
              No records found
            </div>
          )}
        </>
      )}
      <PaginationComponent />
    </div>
  );
};

export default memo(RecordsTable);

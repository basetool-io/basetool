import { OrderDirection } from "@/features/tables/types";
import { debounce } from "lodash";
import { extractMessageFromRTKError } from "@/lib/helpers";
import {
  useColumns,
  useFilters,
  useOrderRecords,
  usePagination,
  useRecords,
  useResetState,
} from "@/features/records/hooks";
import { useDataSourceContext } from "@/hooks";
import { useGetColumnsQuery } from "@/features/fields/api-slice";
import { useGetDataSourceQuery } from "@/features/data-sources/api-slice";
import { useLazyGetRecordsQuery } from "@/features/records/api-slice";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo } from "react";
import RecordsIndexPage from "@/features/records/components/RecordsIndexPage";

function TableShow() {
  const router = useRouter();
  const resetState = useResetState();
  const { viewId, tableName, dataSourceId } = useDataSourceContext();
  const { data: dataSourceResponse } = useGetDataSourceQuery(
    { dataSourceId },
    { skip: !dataSourceId }
  );

  useEffect(() => {
    resetState();
  }, [tableName, dataSourceId]);

  const { encodedFilters } = useFilters();
  const { limit, offset } = usePagination();
  const { orderBy, orderDirection } = useOrderRecords(
    (router.query.orderBy as string) || "",
    (router.query.orderDirection as OrderDirection) || ""
  );
  const getRecordsArguments = useMemo(
    () => ({
      dataSourceId,
      tableName,
      filters: encodedFilters,
      limit: limit.toString(),
      offset: offset.toString(),
      orderBy: orderBy,
      orderDirection: orderDirection,
      startingAfter: router.query.startingAfter as string,
      endingBefore: router.query.endingBefore as string,
    }),
    [
      dataSourceId,
      tableName,
      encodedFilters,
      limit,
      offset,
      orderBy,
      orderDirection,
      router.query.startingAfter,
      router.query.endingBefore,
    ]
  );

  const [
    fetchRecords,
    {
      data: recordsResponse,
      error: recordsError,
      isFetching: recordsAreFetching,
    },
  ] = useLazyGetRecordsQuery();

  /**
   * Because there's one extra render between the momnet the tableName and the state reset changes,
   * we're debouncing fetching the records so we don't try to fetch the records with the old filters
   */
  const debouncedFetch = useCallback(debounce(fetchRecords, 50), []);

  useEffect(() => {
    if (tableName && dataSourceId) debouncedFetch(getRecordsArguments);
  }, [viewId, tableName, dataSourceId, getRecordsArguments]);

  const { meta } = useRecords(recordsResponse?.data, recordsResponse?.meta);

  let skip = true;
  if (dataSourceId && tableName) skip = false;
  if ((meta as any)?.dataSourceInfo?.supports?.columnsRequest) skip = false;

  const {
    data: columnsResponse,
    error: columnsError,
    isFetching: columnsAreFetching,
  } = useGetColumnsQuery({ dataSourceId, tableName }, { skip });

  useColumns({
    dataSourceResponse,
    recordsResponse,
    columnsResponse,
  });

  const isFetching = recordsAreFetching || columnsAreFetching;

  const error: string | undefined = useMemo(() => {
    if (recordsError) return extractMessageFromRTKError(recordsError);
    if (columnsError) return extractMessageFromRTKError(columnsError);

    return;
  }, [recordsError, columnsError]);

  return <RecordsIndexPage error={error} isFetching={isFetching} />;
}

export default TableShow;

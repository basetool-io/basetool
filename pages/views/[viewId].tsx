import { OrderDirection } from "@/features/tables/types";
import { debounce } from "lodash";
import { extractMessageFromRTKError } from "@/lib/helpers";
import { resetState } from "@/features/app/state-slice";
import {
  useColumns,
  useFilters,
  useOrderRecords,
  usePagination,
  useRecords,
} from "@/features/records/hooks";
import { useDataSourceContext } from "@/hooks";
import { useGetColumnsQuery } from "@/features/fields/api-slice";
import { useGetDataSourceQuery } from "@/features/data-sources/api-slice";
import { useGetViewQuery } from "@/features/views/api-slice";
import { useLazyGetRecordsQuery } from "@/features/records/api-slice";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo } from "react";
import RecordsIndexPage from "@/features/records/components/RecordsIndexPage";

function ViewShow() {
  const router = useRouter();
  const { viewId, tableName, dataSourceId } = useDataSourceContext();
  const { data: viewResponse } = useGetViewQuery({ viewId }, { skip: !viewId });
  const { data: dataSourceResponse } = useGetDataSourceQuery(
    { dataSourceId },
    { skip: !dataSourceId }
  );

  useEffect(() => {
    resetState();
  }, [viewId]);

  const { encodedFilters } = useFilters();
  const { limit, offset } = usePagination();
  const { orderBy, orderDirection } = useOrderRecords(
    (router.query.orderBy as string) ||
      viewResponse?.data?.defaultOrder[0]?.columnName ||
      "",
    (router.query.orderDirection as OrderDirection) ||
      viewResponse?.data?.defaultOrder[0]?.direction ||
      ""
  );

  const getRecordsArguments = useMemo(
    () => ({
      viewId,
      filters: encodedFilters,
      limit: limit.toString(),
      offset: offset.toString(),
      orderBy: orderBy,
      orderDirection: orderDirection,
    }),
    [viewId, encodedFilters, limit, offset, orderBy, orderDirection]
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
   * Because there's one extra render between the moment the tableName and the state reset changes,
   * we're debouncing fetching the records so we don't try to fetch the records with the old filters
   */
  const debouncedFetch = useCallback(debounce(fetchRecords, 50), []);

  useEffect(() => {
    if (tableName && dataSourceId) debouncedFetch(getRecordsArguments);
  }, [viewId, tableName, dataSourceId, getRecordsArguments]);

  const { meta } = useRecords(recordsResponse?.data, recordsResponse?.meta);

  let skip = true;
  if (viewId) skip = false;
  if ((meta as any)?.dataSourceInfo?.supports?.columnsRequest) skip = false;

  const {
    data: columnsResponse,
    error: columnsError,
    isFetching: columnsAreFetching,
  } = useGetColumnsQuery({ viewId }, { skip });

  useColumns({
    dataSourceResponse,
    recordsResponse,
    columnsResponse,
    tableName,
  });

  const isFetching = recordsAreFetching || columnsAreFetching;

  const error: string | undefined = useMemo(() => {
    if (recordsError) return extractMessageFromRTKError(recordsError);
    if (columnsError) return extractMessageFromRTKError(columnsError);

    return;
  }, [recordsError, columnsError]);

  return <RecordsIndexPage error={error} isFetching={isFetching} />;
}

export default ViewShow;

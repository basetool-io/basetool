import { OrderDirection } from "@/features/tables/types";
import { OrderParams } from "@/features/views/types";
import { convertToBaseFilters } from "@/features/records/convertToBaseFilters"
import { debounce, first, isArray } from "lodash";
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
import { useDataSourceResponse } from "@/features/data-sources/hooks";
import { useGetColumnsQuery } from "@/features/fields/api-slice";
import { useLazyGetRecordsQuery } from "@/features/records/api-slice";
import { useRouter } from "next/router";
import { useViewResponse } from "@/features/views/hooks";
import React, { useCallback, useEffect, useMemo } from "react";
import RecordsIndexPage from "@/features/records/components/RecordsIndexPage";

function ViewShow() {
  const router = useRouter();
  const { viewId, tableName, dataSourceId } = useDataSourceContext();
  const { view } = useViewResponse(viewId);
  const { response: dataSourceResponse } = useDataSourceResponse(dataSourceId);

  useEffect(() => {
    if (view && isArray(view.filters)) {
      const filters = convertToBaseFilters(view.filters as [])

      setFilters(filters)
      setAppliedFilters(filters)
    }
  }, [view]);

  useEffect(() => {
    resetState();

    return () => {
      resetState();
    }
  }, [viewId]);

  const { encodedFilters, setFilters, setAppliedFilters } = useFilters();
  const { limit, offset } = usePagination();
  const { orderBy, orderDirection } = useOrderRecords(
    (router.query.orderBy as string) ||
      first(view?.defaultOrder as OrderParams[])?.columnName ||
      "",
    (router.query.orderDirection as OrderDirection) ||
      first(view?.defaultOrder as OrderParams[])?.direction ||
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

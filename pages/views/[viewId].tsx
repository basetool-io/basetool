import { OrderDirection } from "@/features/tables/types";
import { OrderParams } from "@/features/views/types";
import { debounce, first } from "lodash";
import { extractMessageFromRTKError } from "@/lib/helpers";
import {
  useColumns,
  useFilters,
  useOrderRecords,
  usePagination,
} from "@/features/records/hooks";
import { useDataSourceContext } from "@/hooks";
import { useDataSourceResponse } from "@/features/data-sources/hooks";
import { useGetColumnsQuery } from "@/features/fields/api-slice";
import { useLazyGetRecordsQuery } from "@/features/records/api-slice";
import { useRouter } from "next/router";
import { useView } from "@/features/views/hooks";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import RecordsIndexPage from "@/features/records/components/RecordsIndexPage";

function ViewShow() {
  const router = useRouter();
  const { viewId, tableName, dataSourceId } = useDataSourceContext();
  const { view } = useView({ viewId });
  const { response: dataSourceResponse } = useDataSourceResponse(dataSourceId);

  useEffect(() => {
    // if (view && isArray(view.filters)) {
    //   const filters = convertToBaseFilters(view.filters as []);
    //   setFilters(filters);
    //   setAppliedFilters(filters);
    // }
  }, [view]);

  useEffect(() => {
    // resetState();
    console.log("in effect resetState");

    // return () => {
    //   // console.log('1')
    //   resetState();
    // }
  }, [viewId]);

  const [initialized, setInitialized] = useState(false);

  const { encodedFilters, setFilters, setAppliedFilters } = useFilters();
  const { limit, offset } = usePagination();
  const { orderBy, orderDirection, setOrderBy, setOrderDirection } =
    useOrderRecords();

  const getRecordsArguments = useMemo(() => {
    console.log("getRecordsArguments->", getRecordsArguments);
    return {
      viewId,
      filters: encodedFilters,
      limit: limit.toString(),
      offset: offset.toString(),
      orderBy: orderBy,
      orderDirection: orderDirection,
    };
  }, [viewId, encodedFilters, limit, offset, orderBy, orderDirection]);

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
    console.log("shouldFetch->", tableName, dataSourceId, initialized);
    if (tableName && dataSourceId && initialized)
      fetchRecords(getRecordsArguments);
  }, [viewId, tableName, dataSourceId, getRecordsArguments, initialized]);

  const records = useMemo(
    () => (recordsResponse?.ok ? recordsResponse?.data : []),
    [recordsResponse?.data]
  );

  // const { meta } = useRecords([], recordsResponse?.meta);

  let skip = true;
  if (viewId) skip = false;
  // if ((meta as any)?.dataSourceInfo?.supports?.columnsRequest) skip = false;

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

  useEffect(() => {
    // Do the initial initialization

    // setPagination
    const orderBy =
      (router.query.orderBy as string) ||
      first(view?.defaultOrder as OrderParams[])?.columnName ||
      "";
    const orderDirection =
      (router.query.orderDirection as OrderDirection) ||
      first(view?.defaultOrder as OrderParams[])?.direction ||
      "";

    setOrderBy(orderBy);
    setOrderDirection(orderDirection);
    setInitialized(true);
    console.log("setInitialized->");

    // effect
    // return () => {
    //   cleanup
    // }
  }, []);

  return (
    <RecordsIndexPage records={records} error={error} isFetching={isFetching} />
  );
}

export default ViewShow;

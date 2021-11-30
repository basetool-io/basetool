import { OrderDirection } from "@/features/tables/types";
import { OrderParams } from "@/features/views/types";
import { debounce, first } from "lodash";
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
import { useDataSourceResponse } from "@/features/data-sources/hooks";
import { useGetColumnsQuery } from "@/features/fields/api-slice";
import { useLazyGetRecordsQuery } from "@/features/records/api-slice";
import { useRouter } from "next/router";
import { useViewResponse } from "@/features/views/hooks";
import React, { useCallback, useEffect, useMemo } from "react";
import RecordsIndexPage from "@/features/records/components/RecordsIndexPage";

function ViewShow() {
  const router = useRouter();
  const resetState = useResetState();
  const { viewId, tableName, dataSourceId } = useDataSourceContext();
  const { view } = useViewResponse(viewId);
  const { response: dataSourceResponse } = useDataSourceResponse(dataSourceId);

  const { encodedFilters, setFilters, setAppliedFilters } = useFilters();
  const { limit, offset, setPage } = usePagination();
  // const { orderBy, orderDirection } = useOrderRecords(
  //   (router.query.orderBy as string) ||
  //     first(view?.defaultOrder as OrderParams[])?.columnName ||
  //     "",
  //   (router.query.orderDirection as OrderDirection) ||
  //     first(view?.defaultOrder as OrderParams[])?.direction ||
  //     ""
  // );

  const { orderBy, orderDirection, setOrderBy, setOrderDirection } =
  useOrderRecords();

  useEffect(() => {
    resetState();
  }, [viewId]);

  useEffect(() => {
    if (view && view?.filters) {
      console.log("view?.filters->", view?.filters);
      setFilters(view?.filters as []);
      setAppliedFilters(view?.filters as []);
    }
  }, [view]);

  useEffect(() => {
    return () => {
      resetState();
    };
  }, []);

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
  const debouncedFetch = useCallback(debounce(fetchRecords, 90), []);

  // useEffect(() => {
  //   console.log("debouncedFetch->", { viewId, tableName, dataSourceId });
  //   // debouncedFetch(getRecordsArguments);
  //   // resetState()
  //   fetchRecords(getRecordsArguments);
  // }, [getRecordsArguments]);

  const { meta } = useRecords(recordsResponse?.data, recordsResponse?.meta);

  let skip = true;
  if (viewId) skip = false;
  if ((meta as any)?.dataSourceInfo?.supports?.columnsRequest) skip = false;

  // const {
  //   data: columnsResponse,
  //   error: columnsError,
  //   isFetching: columnsAreFetching,
  // } = useGetColumnsQuery({ viewId }, { skip });

  useColumns({
    dataSourceResponse,
    recordsResponse,
    // columnsResponse,
  });

  // const isFetching = recordsAreFetching || columnsAreFetching;
  const isFetching = recordsAreFetching;

  const error: string | undefined = useMemo(() => {
    if (recordsError) return extractMessageFromRTKError(recordsError);
    // if (columnsError) return extractMessageFromRTKError(columnsError);

    return;
  // }, [recordsError, columnsError]);
  }, [recordsError]);

  // get/set order
  // get/set filters
  // get/set pagination
  // fetch records

  useEffect(() => {
    // get initial orderBy & orderDirection
    const initialOrderBy =
      (router.query.orderBy as string) ||
      first(view?.defaultOrder as OrderParams[])?.columnName ||
      "";
    const initialOrderDirection =
      (router.query.orderDirection as OrderDirection) ||
      first(view?.defaultOrder as OrderParams[])?.direction ||
      "";
    setOrderBy(initialOrderBy);
    setOrderDirection(initialOrderDirection);

    const initialPage = parseInt(router.query.page as string);
    console.log('setPage->', initialPage, router.query.page)
    if (initialPage) {
      console.log('initialPage->', initialPage)
      setPage(initialPage)}
    // console.log("debouncedFetch->", { viewId, tableName, dataSourceId });
    // debouncedFetch(getRecordsArguments);
    // resetState()

    console.log('viewId->', viewId)
    if (viewId) fetchRecords(getRecordsArguments);
  }, [viewId]);

  return (
    <>
      <pre>{JSON.stringify(isFetching, null, 2)}</pre>
      <RecordsIndexPage error={error} isFetching={isFetching} />
    </>
  );
}

export default ViewShow;

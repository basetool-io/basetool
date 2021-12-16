import { OrderDirection } from "@/features/tables/types";
import { OrderParams } from "@/features/views/types";
import { convertToBaseFilters } from "@/features/records/convertToBaseFilters";
import { encodeObject } from "@/lib/encoding";
import { extractMessageFromRTKError } from "@/lib/helpers";
import { first, isArray } from "lodash";
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
import { useView } from "@/features/views/hooks";
import React, { useEffect, useMemo, useState } from "react";
import RecordsIndexPage from "@/features/records/components/RecordsIndexPage";

function ViewShow() {
  const router = useRouter();
  const { viewId, tableName, dataSourceId } = useDataSourceContext();
  const { view } = useView({ viewId });
  const { response: dataSourceResponse, info: dataSourceInfo } =
    useDataSourceResponse(dataSourceId);

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

  // const [initialized, setInitialized] = useState(false);

  // const { encodedFilters, setFilters, setAppliedFilters } = useFilters();
  // const { limit, offset } = usePagination();
  // const { orderBy, orderDirection, setOrderBy, setOrderDirection } =
  //   useOrderRecords();

  // const getRecordsArguments = useMemo(
  //   () => ({
  //     viewId,
  //     filters: encodedFilters,
  //     limit: limit.toString(),
  //     offset: offset.toString(),
  //     orderBy: orderBy,
  //     orderDirection: orderDirection,
  //   }),
  //   [viewId, encodedFilters, limit, offset, orderBy, orderDirection]
  // );

  const [
    fetchRecords,
    {
      data: recordsResponse,
      error: recordsError,
      isFetching: recordsAreFetching,
    },
  ] = useLazyGetRecordsQuery();
  // console.log("getRecordsArguments->", getRecordsArguments);
  // const {
  //   data: recordsResponse,
  //   error: recordsError,
  //   isFetching: recordsAreFetching,
  // } = useGetRecordsQuery(getRecordsArguments, {
  //   skip: !initialized || !viewId || !dataSourceId,
  // });

  /**
   * Because there's one extra render between the moment the tableName and the state reset changes,
   * we're debouncing fetching the records so we don't try to fetch the records with the old filters
   */
  // const debouncedFetch = useCallback(debounce(fetchRecords, 50), []);

  // useEffect(() => {
  //   console.log("shouldFetch->", tableName, dataSourceId, initialized);
  //   if (tableName && dataSourceId && initialized)
  //     fetchRecords(getRecordsArguments);
  // }, [viewId, tableName, dataSourceId, getRecordsArguments, initialized]);

  const [records, setRecords] = useState([]);

  useEffect(() => {
    if (recordsResponse?.ok) {
      setRecords(recordsResponse?.data);
      setRecordIds(recordsResponse?.data.map(({ id }: { id: string }) => id));
    } else {
      setRecords([]);
      setRecordIds([]);
    }
  }, [recordsResponse?.data]);

  const { setRecordIds, setMeta } = useRecords();

  useEffect(() => {
    if (recordsResponse?.meta) {
      setMeta(recordsResponse?.meta);
    }
  }, [recordsResponse?.meta]);

  let skip = true;
  if (viewId) skip = false;
  if (dataSourceInfo?.supports?.columnsRequest) skip = false;

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

  const columns = useMemo(
    () => (columnsResponse?.ok ? columnsResponse.data : []),
    [columnsResponse]
  );

  const isFetching = recordsAreFetching || columnsAreFetching;

  const error: string | undefined = useMemo(() => {
    if (recordsError) return extractMessageFromRTKError(recordsError);
    if (columnsError) return extractMessageFromRTKError(columnsError);

    return;
  }, [recordsError, columnsError]);

  useEffect(() => {
    // Initialize

    console.log(1);
    if (view) {
      if (view && isArray(view.filters)) {
        console.log(2);
        const filters = convertToBaseFilters(view.filters as []);
        // setFilters(filters);
        // setAppliedFilters(filters);
      }

      // setPagination
      const orderBy =
        (router.query.orderBy as string) ||
        first(view?.defaultOrder as OrderParams[])?.columnName ||
        "";
      const orderDirection =
        (router.query.orderDirection as OrderDirection) ||
        first(view?.defaultOrder as OrderParams[])?.direction ||
        "";

      // setOrderBy(orderBy);
      // setOrderDirection(orderDirection);

      console.log(
        3,
        // convertToBaseFilters(filters as []),
        // convertToBaseFilters(getRecordsArguments.filters as []),
        // getRecordsArguments,
        view.filters
      );
      // setInitialized(true);

      const args = {
        viewId,
        filters: encodeObject(view.filters as []),
        limit: "24",
        offset: "0",
        orderBy: orderBy,
        orderDirection: orderDirection,
      };

      fetchRecords(args);
      // setTimeout(() => {
      // }, 1);
    }
    console.log("setInitialized->");

    // effect
    // return () => {
    //   cleanup
    // }
  }, [view]);

  return (
    <>
      {/* <pre>{JSON.stringify(view, null, 2)}</pre> */}
      <RecordsIndexPage
        records={records}
        columns={columns}
        error={error}
        isFetching={isFetching}
      />
    </>
  );
}

export default ViewShow;

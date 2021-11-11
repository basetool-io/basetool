import { OrderDirection } from "@/features/tables/types";
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
import { useGetRecordsQuery } from "@/features/records/api-slice";
import { useGetViewQuery } from "@/features/views/api-slice";
import { useRouter } from "next/router";
import React, { useEffect, useMemo } from "react";
import RecordsIndexPage from "@/features/records/components/RecordsIndexPage";

function ViewShow() {
  const router = useRouter();
  const { viewId, tableName, dataSourceId } = useDataSourceContext();
  const { data: viewResponse } = useGetViewQuery({ viewId }, { skip: !viewId });
  const { data: dataSourceResponse } = useGetDataSourceQuery(
    { dataSourceId },
    {
      skip: !dataSourceId,
    }
  );

  useEffect(() => {
    resetState();
  }, []);

  useEffect(() => {
    resetState();
  }, [viewId, tableName, dataSourceId]);

  const { encodedFilters } = useFilters();

  const { orderBy, orderDirection } = useOrderRecords(
    (router.query.orderBy as string) ||
      viewResponse?.data?.defaultOrder[0].column,
    (router.query.orderDirection as OrderDirection) ||
      viewResponse?.data?.defaultOrder[0].direction
  );
  const { limit, offset } = usePagination();

  const {
    data: recordsResponse,
    error: recordsError,
    isFetching: recordsAreFetching,
  } = useGetRecordsQuery(
    {
      viewId,
      filters: encodedFilters,
      limit: limit.toString(),
      offset: offset.toString(),
      orderBy: orderBy,
      orderDirection: orderDirection,
    },
    { skip: !viewId }
  );

  let skip = true;
  if (dataSourceResponse?.meta?.dataSourceInfo?.supports?.columnsRequest)
    skip = false;
  if (viewId) skip = false;
  if (dataSourceId && tableName) skip = false;
  const queryPayload = viewId ? { viewId } : { dataSourceId, tableName };
  const {
    data: columnsResponse,
    error: columnsError,
    isFetching: columnsAreFetching,
  } = useGetColumnsQuery(queryPayload, {
    skip,
  });

  useRecords(recordsResponse?.data, recordsResponse?.meta);

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

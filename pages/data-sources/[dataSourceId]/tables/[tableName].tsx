import { OrderDirection } from "@/features/tables/types";
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
import { useGetRecordsQuery } from "@/features/records/api-slice";
import { useGetViewQuery } from "@/features/views/api-slice";
import { useRouter } from "next/router";
import React, { useEffect, useMemo } from "react";
import RecordsIndexPage from "@/features/records/components/RecordsIndexPage";

function TableShow() {
  const router = useRouter();
  const resetState = useResetState();
  const { viewId, tableName, dataSourceId } = useDataSourceContext();

  useEffect(() => {
    resetState();
  }, []);

  useEffect(() => {
    resetState();
  }, [viewId, tableName, dataSourceId]);

  const { data: viewResponse } = useGetViewQuery({ viewId }, { skip: !viewId });
  const { data: dataSourceResponse } = useGetDataSourceQuery(
    { dataSourceId },
    {
      skip: !dataSourceId,
    }
  );

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
      dataSourceId,
      tableName,
      filters: encodedFilters,
      limit: limit.toString(),
      offset: offset.toString(),
      orderBy: orderBy,
      orderDirection: orderDirection,
    },
    { skip: !dataSourceId || !tableName }
  );

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

export default TableShow;

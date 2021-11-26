import { Button } from "@chakra-ui/react";
import { FilterOrFilterGroup, OrderDirection } from "@/features/tables/types";
import { OrderParams } from "@/features/views/types";
import { TrashIcon } from "@heroicons/react/outline";
import { debounce, first, pick } from "lodash";
import { extractMessageFromRTKError } from "@/lib/helpers";
import { resetState } from "@/features/records/state-slice";
import {
  useColumns,
  useFilters,
  useOrderRecords,
  usePagination,
  useRecords,
} from "@/features/records/hooks";
import { useDataSourceContext, useSegment } from "@/hooks";
import { useGetColumnsQuery } from "@/features/fields/api-slice";
import { useGetDataSourceQuery } from "@/features/data-sources/api-slice";
import { useLazyGetRecordsQuery } from "@/features/records/api-slice";
import {
  useRemoveViewMutation,
  useUpdateViewMutation,
} from "@/features/views/api-slice";
import { useRouter } from "next/router";
import { useUpdateColumn, useViewResponse } from "@/features/views/hooks";
import BackButton from "@/features/records/components/BackButton";
import FieldEditor from "@/features/views/components/FieldEditor";
import Layout from "@/components/Layout";
import PageWrapper from "@/components/PageWrapper";
import React, { useCallback, useEffect, useMemo } from "react";
import RecordsTable from "@/features/tables/components/RecordsTable";
import ViewEditColumns from "@/features/views/components/ViewEditColumns";
import ViewEditDataSourceInfo from "@/features/views/components/ViewEditDataSourceInfo";
import ViewEditFilters from "@/features/views/components/ViewEditFilters";
import ViewEditName from "@/features/views/components/ViewEditName";
import ViewEditOrder from "@/features/views/components/ViewEditOrder";
import ViewEditVisibility from "@/features/views/components/ViewEditVisibility";

const Edit = () => {
  const router = useRouter();
  const { viewId, tableName, dataSourceId } = useDataSourceContext();
  const { column } = useUpdateColumn();
  useSegment("Tried to edit a view.", {
    viewId,
  });
  const {
    view,
    isLoading: viewIsLoading,
    error: viewError,
  } = useViewResponse(viewId);

  const { data: dataSourceResponse } = useGetDataSourceQuery(
    { dataSourceId },
    { skip: !dataSourceId }
  );

  useEffect(() => {
    resetState();
  }, [viewId]);

  const backLink = `/views/${viewId}`;
  const crumbs = useMemo(() => ["Edit view", view?.name], [view?.name]);
  const { encodedFilters, appliedFilters } = useFilters();
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
      orderBy,
      orderDirection,
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
   * Because there's one extra render between the momnet the tableName and the state reset changes,
   * we're debouncing fetching the records so we don't try to fetch the records with the old filters
   */
  const debouncedFetch = useCallback(debounce(fetchRecords, 50), []);

  const { meta } = useRecords(recordsResponse?.data, recordsResponse?.meta);

  let skip = true;
  if (viewId) skip = false;
  if ((meta as any)?.dataSourceInfo?.supports?.columnsRequest) skip = false;

  const {
    data: columnsResponse,
    error: columnsError,
    isLoading: columnsAreLoading,
    isFetching: columnsAreFetching,
  } = useGetColumnsQuery({ viewId }, { skip });

  useColumns({
    dataSourceResponse,
    recordsResponse,
    columnsResponse,
    options: { forEdit: true },
  });

  useEffect(() => {
    if (viewId) debouncedFetch(getRecordsArguments);
  }, [
    viewId,
    tableName,
    dataSourceId,
    getRecordsArguments,
    columnsResponse?.data,
  ]);

  const isFetching = recordsAreFetching || columnsAreFetching;

  const error: string | undefined = useMemo(() => {
    if (recordsError) return extractMessageFromRTKError(recordsError);
    if (columnsError) return extractMessageFromRTKError(columnsError);

    return;
  }, [recordsError, columnsError]);

  const [removeView, { isLoading: viewIsRemoving }] = useRemoveViewMutation();

  const handleRemove = async () => {
    if (viewIsLoading || viewIsRemoving) return;

    const confirmed = confirm(
      "Are you sure you want to remove this view? All information about it (settings included) will be completely removed from our servers."
    );
    if (confirmed) {
      await removeView({ viewId }).unwrap();
      await router.push(`/data-sources/${dataSourceId}`);
    }
  };

  const [updateView] = useUpdateViewMutation();

  const body = useMemo(() => {
    return pick(
      {
        ...view,
        filters: appliedFilters.map((filter: FilterOrFilterGroup) => ({
          ...filter,
          isBase: true,
        })),
      },
      ["name", "public", "dataSourceId", "tableName", "filters", "defaultOrder"]
    );
  }, [view, appliedFilters]);

  const commitViewUpdate = async (
    key: string,
    value: string | boolean | OrderParams[] | FilterOrFilterGroup[]
  ) => {
    await updateView({
      viewId,
      body: {
        ...body,
        [key]: value,
      },
    }).unwrap();
  };

  const updateName = async (name: string) => {
    if (name !== view?.name) commitViewUpdate("name", name);
  };

  const updateVisibility = async (publicView: boolean) => {
    commitViewUpdate("public", publicView);
  };

  const updateOrder = async (defaultOrder: OrderParams[]) => {
    commitViewUpdate("defaultOrder", defaultOrder);
  };

  const updateFilters = async (filters: FilterOrFilterGroup[]) => {
    commitViewUpdate("filters", filters);
  };

  return (
    <Layout hideSidebar={true}>
      <PageWrapper
        isLoading={viewIsLoading}
        error={viewError}
        crumbs={crumbs}
        footerElements={{
          left: (
            <Button
              colorScheme="red"
              size="xs"
              variant="outline"
              onClick={handleRemove}
              isLoading={viewIsRemoving}
              leftIcon={<TrashIcon className="h-4" />}
            >
              Delete view
            </Button>
          ),
        }}
        buttons={
          viewId && <BackButton href={backLink}>Back to view</BackButton>
        }
        flush={true}
      >
        <div className="relative flex-1 max-w-full w-full flex">
          <div className="flex flex-shrink-0 w-1/4 border-r p-4">
            {view && (
              <div className="flex flex-col space-y-4 w-full">
                <ViewEditName updateName={updateName} />
                <ViewEditVisibility updateVisibility={updateVisibility} />
                <ViewEditFilters updateFilters={updateFilters} />
                <ViewEditOrder view={view} updateOrder={updateOrder} />
                <ViewEditColumns columnsAreLoading={columnsAreLoading} />
                <ViewEditDataSourceInfo />
              </div>
            )}
          </div>
          <div className="relative flex-1 flex h-full max-w-3/4 w-3/4">
            {column && <FieldEditor />}
            <div className="flex-1 flex overflow-auto">
              {dataSourceId && (
                <RecordsTable error={error} isFetching={isFetching} />
              )}
            </div>
          </div>
        </div>
      </PageWrapper>
    </Layout>
  );
};

export default Edit;

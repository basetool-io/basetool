import { Button } from "@chakra-ui/react";
import { Column } from "@/features/fields/types";
import { DecoratedView, OrderParams } from "@/features/views/types";
import { FilterOrFilterGroup } from "@/features/tables/types";
import { TrashIcon } from "@heroicons/react/outline";
import { isArray, isEmpty, isUndefined, pick } from "lodash";
import { setColumns } from "@/features/views/state-slice";
import { useAppDispatch, useDataSourceContext, useSegment } from "@/hooks";
import { useFilters, useOrderRecords } from "@/features/records/hooks";
import { useGetColumnsQuery } from "@/features/fields/api-slice";
import {
  useGetViewQuery,
  useRemoveViewMutation,
  useUpdateViewMutation,
} from "@/features/views/api-slice";
import { useRouter } from "next/router";
import { useUpdateColumn } from "@/features/views/hooks";
import BackButton from "@/features/records/components/BackButton";
import FieldEditor from "@/features/views/components/FieldEditor";
import Layout from "@/components/Layout";
import PageWrapper from "@/components/PageWrapper";
import React, { useEffect, useMemo, useState } from "react";
import RecordsTable from "@/features/tables/components/RecordsTable";
import ViewEditColumns from "@/features/views/components/ViewEditColumns";
import ViewEditDataSourceInfo from "@/features/views/components/ViewEditDataSourceInfo";
import ViewEditFilters from "@/features/views/components/ViewEditFilters";
import ViewEditName from "@/features/views/components/ViewEditName";
import ViewEditOrder from "@/features/views/components/ViewEditOrder";
import ViewEditVisibility from "@/features/views/components/ViewEditVisibility";

const Edit = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { viewId, dataSourceId } = useDataSourceContext();
  const [localView, setLocalView] = useState<DecoratedView>();
  const { column } = useUpdateColumn();
  useSegment("Tried to edit a view.", {
    viewId,
  });

  const {
    data: viewResponse,
    isLoading: viewIsLoading,
    error: viewError,
  } = useGetViewQuery({ viewId }, { skip: !viewId });

  const backLink = `/views/${viewId}/`;
  const crumbs = useMemo(
    () => ["Edit view", viewResponse?.data?.name],
    [viewResponse?.data?.name]
  );

  const [removeView, { isLoading: viewIsRemoving }] = useRemoveViewMutation();

  const { setFilters, appliedFilters, setAppliedFilters } = useFilters(
    viewResponse?.data?.filters
  );
  const { setOrderBy, setOrderDirection } = useOrderRecords();

  const { data: columnsResponse } = useGetColumnsQuery(
    {
      viewId,
    },
    { skip: !viewId }
  );

  useEffect(() => {
    if (isArray(columnsResponse?.data)) {
      dispatch(setColumns(columnsResponse?.data as Column[]));
    }
  }, [columnsResponse?.data]);

  const setViewData = () => {
    if (viewResponse?.ok) {
      setLocalView(viewResponse.data);

      if (viewResponse.data.filters) {
        setFilters(viewResponse.data.filters);
        setAppliedFilters(viewResponse.data.filters);
      }

      // We have to check whether there is a default order on the view and the order from the query to be empty.
      if (
        viewResponse.data.defaultOrder &&
        !isEmpty(viewResponse.data.defaultOrder) &&
        isUndefined(router.query.orderBy) &&
        isUndefined(router.query.orderDirection)
      ) {
        setOrderBy(viewResponse.data.defaultOrder.columnName);
        setOrderDirection(viewResponse.data.defaultOrder.direction);
      }
    }
  };

  useEffect(() => {
    setViewData();
  }, [viewResponse, viewId]);

  useEffect(() => {
    setViewData();
  }, []);

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
        ...localView,
        filters: appliedFilters.map((filter: FilterOrFilterGroup) => ({
          ...filter,
          isBase: true,
        })),
      },
      ["name", "public", "dataSourceId", "tableName", "filters", "defaultOrder"]
    );
  }, [localView, appliedFilters]);

  const commitViewUpdate = async (
    key: string,
    value: string | boolean | OrderParams[] | FilterOrFilterGroup[]
  ) => {
    setLocalView({
      ...localView,
      [key]: value,
    });
    await updateView({
      viewId,
      body: {
        ...body,
        [key]: value,
      },
    }).unwrap();
  };

  const updateName = async (name: string) => {
    if (name !== localView.name) commitViewUpdate("name", name);
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
        buttons={viewId && <BackButton href={backLink}>Back</BackButton>}
        flush={true}
      >
        <div className="relative flex-1 max-w-full w-full flex">
          <div className="flex flex-shrink-0 w-1/4 border-r p-4">
            {localView && (
              <div className="flex flex-col space-y-4 w-full">
                <ViewEditName updateName={updateName} />
                <ViewEditVisibility updateVisibility={updateVisibility} />
                <ViewEditFilters updateFilters={updateFilters} />
                <ViewEditOrder view={localView} updateOrder={updateOrder} />
                <ViewEditColumns />
                <ViewEditDataSourceInfo />
              </div>
            )}
          </div>
          <div className="relative flex-1 flex h-full max-w-3/4 w-3/4">
            {column && <FieldEditor />}
            <div className="flex-1 flex overflow-auto">
              {dataSourceId && <RecordsTable />}
            </div>
          </div>
        </div>
      </PageWrapper>
    </Layout>
  );
};

export default Edit;

import {
  Button,
  Checkbox,
  Editable,
  EditableInput,
  EditablePreview,
  Tooltip,
  useEditableControls,
} from "@chakra-ui/react";
import { Column } from "@/features/fields/types";
import { DecoratedView, OrderParams } from "@/features/views/types";
import { IFilter, IFilterGroup } from "@/features/tables/types";
import { PencilAltIcon, TrashIcon } from "@heroicons/react/outline";
import { isArray, isEmpty, isUndefined, pick } from "lodash";
import { setColumns } from "@/features/views/state-slice";
import { useAppDispatch, useDataSourceContext } from "@/hooks";
import { useFilters, useOrderRecords } from "@/features/records/hooks";
import { useGetColumnsQuery } from "@/features/fields/api-slice";
import { useGetDataSourceQuery } from "@/features/data-sources/api-slice";
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
import TinyLabel from "@/components/TinyLabel";
import ViewEditColumns from "@/features/views/components/ViewEditColumns";
import ViewEditFilters from "@/features/views/components/ViewEditFilters";
import ViewEditOrder from "@/features/views/components/ViewEditOrder";

const NameEditButton = () => {
  const { isEditing, getEditButtonProps } = useEditableControls();

  if (isEditing) return null;

  return (
    <Tooltip label="Edit name">
      <div
        className="flex justify-center items-center mx-1 text-xs cursor-pointer"
        {...getEditButtonProps()}
      >
        <PencilAltIcon className="h-4 inline" />
        Edit
      </div>
    </Tooltip>
  );
};

const Edit = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { viewId, dataSourceId } = useDataSourceContext();
  const [localView, setLocalView] = useState<DecoratedView>();
  const { column, setColumnOptions } = useUpdateColumn();

  const { data: dataSourceResponse } = useGetDataSourceQuery(
    { dataSourceId },
    {
      skip: !dataSourceId,
    }
  );

  const {
    data: viewResponse,
    isLoading: viewIsLoading,
    error: viewError,
  } = useGetViewQuery({ viewId }, { skip: !viewId });

  const backLink = `/views/${viewId}/`;
  const crumbs = [viewResponse?.data?.name, "Edit"];

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
        filters: appliedFilters.map((filter: IFilter | IFilterGroup) => ({
          ...filter,
          isBase: true,
        })),
      },
      ["name", "public", "dataSourceId", "tableName", "filters", "defaultOrder"]
    );
  }, [localView, appliedFilters]);

  const updateName = async (name: string) => {
    if (name !== localView.name)
      await updateView({
        viewId,
        body: {
          ...body,
          name,
        },
      }).unwrap();
  };

  const updatePublic = async (publicView: boolean) => {
    setLocalView({
      ...localView,
      public: publicView,
    });
    await updateView({
      viewId,
      body: {
        ...body,
        public: publicView,
      },
    }).unwrap();
  };

  const updateOrder = async (defaultOrder: OrderParams[]) => {
    setLocalView({
      ...localView,
      defaultOrder,
    });
    await updateView({
      viewId,
      body: {
        ...body,
        defaultOrder,
      },
    }).unwrap();
  };
    setLocalView({
      ...localView,
      defaultOrder,
    });
    await updateView({
      viewId,
      body: {
        ...body,
        defaultOrder,
      },
    }).unwrap();
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
                <div>
                  <div className="w-1/2 mr-1">
                    <TinyLabel>Name</TinyLabel>
                  </div>
                  <Editable
                    className="flex-1"
                    defaultValue={localView?.name}
                    onSubmit={updateName}
                    submitOnBlur={true}
                  >
                    <div className="relative flex justify-between w-full">
                      <div className="w-full">
                        <EditablePreview className="cursor-pointer" />
                        <EditableInput />
                      </div>
                      <NameEditButton />
                    </div>
                  </Editable>
                </div>
                <div className="grid space-y-4 lg:space-y-0 lg:grid-cols-2">
                  <div>
                    <div className=" mr-1">
                      <TinyLabel>DataSource</TinyLabel>
                    </div>
                    <div className="text-sm flex-1">
                      {dataSourceResponse?.ok && dataSourceResponse.data.name}
                    </div>
                  </div>
                  <div>
                    <div className="">
                      <TinyLabel>Table name</TinyLabel>
                    </div>
                    <div className="text-sm flex-1">{localView?.tableName}</div>
                  </div>
                </div>
                <div>
                  <div className="">
                    <TinyLabel>Visibility</TinyLabel>
                  </div>
                  <div className="flex-1 pt-1">
                    <Checkbox
                      colorScheme="gray"
                      isChecked={localView?.public}
                      onChange={(e) => updatePublic(e.currentTarget.checked)}
                    >
                      Visible to all members
                    </Checkbox>
                  </div>
                </div>

                <ViewEditFilters />
                <ViewEditOrder view={localView} updateOrder={updateOrder} />
                <ViewEditColumns />
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

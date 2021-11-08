import {
  Button,
  Checkbox,
  Editable,
  EditableInput,
  EditablePreview,
  Tooltip,
  useEditableControls,
} from "@chakra-ui/react";
import { DecoratedView } from "@/features/views/types";
import { IFilter, IFilterGroup } from "@/features/tables/types";
import { PencilAltIcon, TrashIcon } from "@heroicons/react/outline";
import { Save } from "react-feather";
import { activeColumnSelector } from "@/features/views/state-slice";
import { isArray, isEmpty, isUndefined, pick } from "lodash";
import { setColumns } from "@/features/views/state-slice";
import { useAppDispatch, useAppSelector, useDataSourceContext } from "@/hooks";
import { useFilters, useOrderRecords } from "@/features/records/hooks";
import { useGetColumnsQuery } from "@/features/views/api-slice";
import { useGetDataSourceQuery } from "@/features/data-sources/api-slice";
import {
  useGetViewQuery,
  useRemoveViewMutation,
  useUpdateViewMutation,
} from "@/features/views/api-slice";
import { useRouter } from "next/router";
import BackButton from "@/features/records/components/BackButton";
import ColumnsConfigurator from "@/features/views/components/ColumnsConfigurator";
import DefaultOrderConfigurator from "@/features/views/components/DefaultOrderConfigurator";
import FieldTypeOption from "@/features/views/components/FieldTypeOption";
import FiltersConfigurator from "@/features/views/components/FiltersConfigurator";
import Layout from "@/components/Layout";
import PageWrapper from "@/components/PageWrapper";
import React, { useEffect, useMemo, useState } from "react";
import RecordsTable from "@/features/tables/components/RecordsTable";
import TinyLabel from "@/components/TinyLabel";
import VisibilityOption from "@/features/views/components/VisibilityOption";

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
  const { viewId, dataSourceId, tableName } = useDataSourceContext();
  console.log("viewId->", viewId);
  const [localView, setLocalView] = useState<DecoratedView>();
  const activeColumn = useAppSelector(activeColumnSelector);

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
  console.log("columnsResponse->", columnsResponse);

  useEffect(() => {
    console.log("columnsResponse?.data->", columnsResponse?.data);
    if (isArray(columnsResponse?.data)) {
      dispatch(setColumns(columnsResponse?.data));
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

  const [updateView, { isLoading: viewIsUpdating }] = useUpdateViewMutation();

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

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await updateView({
      viewId,
      body,
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
              Remove view
            </Button>
          ),
          center: (
            <Button
              colorScheme="blue"
              size="sm"
              width="300px"
              onClick={handleSubmit}
              isLoading={viewIsUpdating}
              leftIcon={<Save className="h-4" />}
            >
              Save
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
                    value={localView?.name}
                    onChange={(value: string) => {
                      if (value && !isEmpty(value)) {
                        setLocalView({
                          ...localView,
                          name: value,
                        });
                      }
                    }}
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
                {dataSourceResponse?.ok && (
                  <div>
                    <div className="w-1/2 mr-1">
                      <TinyLabel>DataSource</TinyLabel>
                    </div>
                    <div className="flex-1">{dataSourceResponse.data.name}</div>
                  </div>
                )}
                <div>
                  <div className="w-1/2">
                    <TinyLabel>Table name</TinyLabel>
                  </div>
                  <div className="flex-1">{localView?.tableName}</div>
                </div>
                <div>
                  <div className="w-1/2">
                    <TinyLabel>Public</TinyLabel>
                  </div>
                  <div className="flex-1 pt-1">
                    <Checkbox
                      colorScheme="gray"
                      isChecked={localView?.public}
                      onChange={(e) =>
                        setLocalView({
                          ...localView,
                          public: !localView?.public,
                        })
                      }
                    >
                      View is public
                    </Checkbox>
                  </div>
                </div>

                <FiltersConfigurator view={localView} setView={setLocalView} />
                <DefaultOrderConfigurator
                  view={localView}
                  setView={setLocalView}
                />
                <ColumnsConfigurator view={localView} setView={setLocalView} />
              </div>
            )}
          </div>
          <div className="relative flex-1 flex h-full max-w-3/4 w-3/4">
            {activeColumn && (
              <div className="block space-y-4 py-4 w-1/3">
                <FieldTypeOption />
                <VisibilityOption />
              </div>
            )}
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

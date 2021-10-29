import {
  Button,
  Checkbox,
  Collapse,
  Editable,
  EditableInput,
  EditablePreview,
  Select,
  Tooltip,
  useDisclosure,
  useEditableControls,
} from "@chakra-ui/react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  PencilAltIcon,
  PlusCircleIcon,
  TrashIcon,
  XIcon,
} from "@heroicons/react/outline";
import { IFilter, IFilterGroup, OrderDirection } from "@/features/tables/types";
import { Save } from "react-feather";
import { View } from "@prisma/client";
import { Views } from "@/features/fields/enums";
import { getFilteredColumns } from "@/features/fields";
import { isEmpty, isUndefined, pick } from "lodash";
import { useBoolean, useClickAway } from "react-use";
import { useDataSourceContext } from "@/hooks";
import { useFilters, useOrderRecords } from "@/features/records/hooks";
import { useGetColumnsQuery } from "@/features/tables/api-slice";
import { useGetDataSourceQuery } from "@/features/data-sources/api-slice";
import {
  useGetViewQuery,
  useRemoveViewMutation,
  useUpdateViewMutation,
} from "@/features/views/api-slice";
import { useRouter } from "next/router";
import BackButton from "@/features/records/components/BackButton";
import CompactFiltersView from "@/features/views/components/CompactFiltersView";
import FiltersPanel from "@/features/tables/components/FiltersPanel";
import Layout from "@/components/Layout";
import PageWrapper from "@/components/PageWrapper";
import React, { useEffect, useMemo, useRef, useState } from "react";
import RecordsTable from "@/features/tables/components/RecordsTable";
import TinyLabel from "@/components/TinyLabel";

const OrderDirections = [
  {
    value: "asc",
    label: "Ascending A→Z 1→9",
  },
  {
    value: "desc",
    label: "Descending Z→A 9→1",
  },
];

type DecoratedView = View & {
  defaultOrder: { columnName?: string; direction?: OrderDirection };
};

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
  const { viewId, dataSourceId, tableName } = useDataSourceContext();
  const [localView, setLocalView] = useState<DecoratedView>();

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

  const setViewData = () => {
    if (viewResponse?.ok) {
      setLocalView(viewResponse.data);

      if (viewResponse.data.filters) {
        setFilters(viewResponse.data.filters);
        setAppliedFilters(viewResponse.data.filters)
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

  const { data: columnsResponse } = useGetColumnsQuery(
    {
      dataSourceId,
      tableName,
    },
    {
      skip: !dataSourceId || !tableName,
    }
  );

  const columns = useMemo(
    () => getFilteredColumns(columnsResponse?.data, Views.index),
    [columnsResponse?.data]
  );

  const [filtersPanelVisible, toggleFiltersPanelVisible] = useBoolean(false);
  const filtersButton = useRef(null);
  const filtersPanel = useRef(null);
  useClickAway(filtersPanel, (e) => {
    // When a user click the filters button to close the filters panel, the button is still outside,
    // so the action triggers twice closing and opening the filters panel.
    if (e.target !== filtersButton.current) {
      toggleFiltersPanelVisible(false);
    }
  });

  const { isOpen: isFiltersOpen, onToggle: toggleFiltersOpen } = useDisclosure({
    defaultIsOpen: true,
  });

  const defaultOrder = useMemo(() => {
    if (isEmpty(columns)) return {};

    return {
      columnName: columns[0].name,
      direction: "asc",
    };
  }, [columns]);

  useEffect(() => {
    setOrderBy(localView?.defaultOrder?.columnName || "");
    setOrderDirection(
      (localView?.defaultOrder?.direction as OrderDirection) || ""
    );
  }, [localView?.defaultOrder]);

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
        buttons={<BackButton href={backLink}>Back</BackButton>}
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

                <div>
                  <div className="relative flex justify-between w-full">
                    <div
                      className="w-full cursor-pointer "
                      onClick={toggleFiltersOpen}
                    >
                      <TinyLabel>Base filters</TinyLabel>{" "}
                      {isFiltersOpen ? (
                        <ChevronDownIcon className="h-3 inline" />
                      ) : (
                        <ChevronLeftIcon className="h-3 inline" />
                      )}
                    </div>
                    <Tooltip label="Edit filters">
                      <div
                        className="flex justify-center items-center mx-1 text-xs cursor-pointer"
                        onClick={() => toggleFiltersPanelVisible()}
                        ref={filtersButton}
                      >
                        <PencilAltIcon className="h-4 inline mr-px" /> Edit
                      </div>
                    </Tooltip>
                    {filtersPanelVisible && (
                      <div className="absolute left-auto right-0 -top-8">
                        <FiltersPanel ref={filtersPanel} />
                      </div>
                    )}
                  </div>
                  <Collapse in={isFiltersOpen}>
                    <CompactFiltersView filters={appliedFilters} />
                  </Collapse>
                </div>

                <div>
                  <div className="relative flex w-full justify-between items-center">
                    <TinyLabel>Default order</TinyLabel>
                    <div>
                      {isEmpty(localView?.defaultOrder) && (
                        <Tooltip label="Add order rule">
                          <div
                            className="flex justify-center items-center mx-1 text-xs cursor-pointer"
                            onClick={() =>
                              setLocalView({
                                ...localView,
                                defaultOrder: defaultOrder as any,
                              })
                            }
                          >
                            <PlusCircleIcon className="h-4 inline mr-px" /> Add
                          </div>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                  <div className="mt-2">
                    {isEmpty(localView?.defaultOrder) && (
                      <div className="text-sm text-gray-600">
                        No default order applied to this view
                      </div>
                    )}
                    {isEmpty(localView?.defaultOrder) || (
                      <div className="flex w-full space-x-2">
                        <Select
                          size="xs"
                          className="font-mono"
                          value={(localView?.defaultOrder as any)?.columnName}
                          onChange={(e) =>
                            setLocalView({
                              ...localView,
                              defaultOrder: {
                                ...(localView.defaultOrder as any),
                                columnName: e.currentTarget.value,
                              },
                            })
                          }
                        >
                          {columns &&
                            columns.map((column, idx) => (
                              <option key={idx} value={column.name}>
                                {column.label}
                              </option>
                            ))}
                        </Select>
                        <Select
                          size="xs"
                          className="font-mono"
                          value={(localView?.defaultOrder as any)?.direction}
                          onChange={(e) =>
                            setLocalView({
                              ...localView,
                              defaultOrder: {
                                ...(localView.defaultOrder as any),
                                direction: e.currentTarget.value,
                              },
                            })
                          }
                        >
                          {OrderDirections.map((order, idx) => (
                            <option key={idx} value={order.value}>
                              {order.label}
                            </option>
                          ))}
                        </Select>
                        <Tooltip label="Remove order rule">
                          <Button
                            size="xs"
                            variant="link"
                            onClick={() =>
                              setLocalView({
                                ...localView,
                                defaultOrder: {},
                              })
                            }
                          >
                            <XIcon className="h-3 text-gray-700" />
                          </Button>
                        </Tooltip>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="relative flex-1 flex h-full max-w-3/4 w-3/4">
            {dataSourceId && <RecordsTable />}
          </div>
        </div>
      </PageWrapper>
    </Layout>
  );
};

export default Edit;

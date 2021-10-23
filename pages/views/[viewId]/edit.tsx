import {
  Button,
  Checkbox,
  Collapse,
  Editable,
  EditableInput,
  EditablePreview,
  Tooltip,
  useDisclosure,
  useEditableControls,
} from "@chakra-ui/react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  PencilAltIcon,
  TrashIcon,
} from "@heroicons/react/outline";
import { IFilter, IFilterGroup } from "@/features/tables/components/Filter";
import { Save } from "react-feather";
import { View } from "@prisma/client";
import { Views } from "@/features/fields/enums";
import { getFilteredColumns } from "@/features/fields";
import { isEmpty, pick } from "lodash";
import { useBoolean, useClickAway } from "react-use";
import { useDataSourceContext, useFilters } from "@/hooks";
import { useGetColumnsQuery } from "@/features/tables/api-slice";
import { useGetDataSourceQuery } from "@/features/data-sources/api-slice";
import {
  useGetViewQuery,
  useRemoveViewMutation,
  useUpdateViewMutation,
} from "@/features/views/api-slice";
import { useRouter } from "next/router";
import BackButton from "@/features/records/components/BackButton";
import FiltersPanel from "@/features/tables/components/FiltersPanel";
import Layout from "@/components/Layout";
import PageWrapper from "@/components/PageWrapper";
import React, { useEffect, useMemo, useRef, useState } from "react";
import RecordsIndex from "@/features/records/components/RecordsIndex";

const CompactFiltersView = ({
  filters,
}: {
  filters: Array<IFilter | IFilterGroup>;
}) => {
  return (
    <div className="space-y-1">
      {isEmpty(filters) && (
        <div className="text-sm text-gray-600">
          No base filters applied to this view
        </div>
      )}

      {isEmpty(filters) ||
        filters.map((filter, idx) => {
          if ("isGroup" in filter && filter.isGroup) {
            return (
              <div className="text-gray-600">
                <span>{filter.verb}</span>
                <div className="bg-gray-200 rounded">
                  {filter.filters.map((f, i) => {
                    return (
                      <div className="px-1">
                        {idx === 0 || i === 0 ? "" : f.verb}{" "}
                        <div>
                          <span className="font-bold ">{f.column.label}</span>{" "}
                          {f.condition.replaceAll("_", " ")}{" "}
                          <span className="font-bold">
                            {f.value
                              ? f.value
                              : f.option
                              ? f.option.replaceAll("_", " ")
                              : ""}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          } else {
            return (
              <div className="text-gray-600">
                <div><span>{idx === 0 ? "" : filter.verb}</span></div>
                <span className="font-bold">
                  {(filter as IFilter).column.label}
                </span>{" "}
                {(filter as IFilter).condition.replaceAll("_", " ")}{" "}
                <span className="font-bold">
                  {(filter as IFilter).value
                    ? (filter as IFilter).value
                    : (filter as IFilter)?.option
                    ? (filter as any).option.replaceAll("_", " ")
                    : ""}
                </span>
              </div>
            );
          }
        })}
    </div>
  );
};

const Edit = () => {
  const router = useRouter();
  const { viewId, dataSourceId, tableName } = useDataSourceContext();
  const [localView, setLocalView] = useState<View>();

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

  const { setFilters, applyFilters, appliedFilters, resetFilters } =
    useFilters();

  useEffect(() => {
    resetFilters();
    if (viewResponse?.ok) {
      setLocalView(viewResponse.data);
      if (viewResponse.data.filters) {
        setFilters(viewResponse.data.filters);
        applyFilters(viewResponse.data.filters);
      }
    }
  }, [viewResponse]);

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

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await updateView({
      viewId,
      body: pick(
        {
          ...localView,
          filters: appliedFilters.map(
            (filter: IFilter | IFilterGroup) => ({
              ...filter,
              isBase: true,
            })
          ),
        },
        ["name", "public", "dataSourceId", "tableName", "filters"]
      ),
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

  const EditableControls = () => {
    const { isEditing, getEditButtonProps } = useEditableControls();

    if (!isEditing) {
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
    } else {
      return <div></div>;
    }
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
        buttons={<BackButton href={backLink}>Back</BackButton>}
        flush={true}
      >
        <div className="relative flex-1 max-w-full w-full flex">
          <div className="flex flex-shrink-0 w-1/4 border-r p-4">
            {localView && (
              <div className="space-y-2 w-full">
                <div className="relative flex w-full">
                  <div className="w-1/4 my-auto mr-1 font-bold">Name</div>
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
                    // isPreviewFocusable={false}
                  >
                    <div className="relative flex justify-between w-full">
                      <div className="w-full">
                        <EditablePreview className="cursor-pointer" />
                        <EditableInput />
                      </div>
                      <EditableControls />
                    </div>
                  </Editable>
                </div>
                {dataSourceResponse?.ok && (
                  <div className="relative flex w-full h-[30px]">
                    <div className="w-1/4 my-auto mr-1 font-bold">
                      DataSource
                    </div>
                    <div className="my-auto">
                      {dataSourceResponse.data.name}
                    </div>
                  </div>
                )}
                <div className="relative flex w-full h-[30px]">
                  <div className="w-1/4 my-auto mr-1 font-bold">Table name</div>
                  <div className="my-auto">{localView?.tableName}</div>
                </div>
                <div className="relative flex w-full h-[30px]">
                  <div className="w-1/4 my-auto mr-1 font-bold">Public</div>
                  <div className="my-auto pt-1">
                    <Checkbox
                      size="lg"
                      colorScheme="gray"
                      isChecked={localView?.public}
                      onChange={(e) =>
                        setLocalView({
                          ...localView,
                          public: !localView?.public,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="relative flex justify-between w-full">
                  <div
                    className="w-full cursor-pointer font-bold"
                    onClick={toggleFiltersOpen}
                  >
                    Base filters{" "}
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
                      <PencilAltIcon className="h-4 inline" />
                      Edit
                    </div>
                  </Tooltip>
                  {filtersPanelVisible && (
                    <div className="absolute left-auto right-0 -top-8">
                      <FiltersPanel ref={filtersPanel} columns={columns} isEditBaseFilters={true} />
                    </div>
                  )}
                </div>
                <Collapse in={isFiltersOpen}>
                  <CompactFiltersView filters={appliedFilters} />
                </Collapse>
              </div>
            )}
          </div>
          <div className="relative flex-1 flex h-full max-w-3/4 w-3/4">
            <RecordsIndex displayOnlyTable={true} />
          </div>
        </div>
      </PageWrapper>
    </Layout>
  );
};

export default Edit;

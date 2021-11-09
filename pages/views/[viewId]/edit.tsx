import {
  Button,
  Checkbox,
  Code,
  Editable,
  EditableInput,
  EditablePreview,
  Tooltip,
  useEditableControls,
} from "@chakra-ui/react";
import { Column } from "@/features/fields/types";
import { DecoratedView } from "@/features/views/types";
import { IFilter, IFilterGroup } from "@/features/tables/types";
import { PencilAltIcon, TrashIcon } from "@heroicons/react/outline";
import { Save } from "react-feather";
import { isArray, isEmpty, isUndefined, pick } from "lodash";
import { setColumns } from "@/features/views/state-slice";
import { useAppDispatch, useDataSourceContext } from "@/hooks";
import {
  useDeleteColumnMutation,
  useGetColumnsQuery,
} from "@/features/views/api-slice";
import { useFilters, useOrderRecords } from "@/features/records/hooks";
import { useGetDataSourceQuery } from "@/features/data-sources/api-slice";
import {
  useGetViewQuery,
  useRemoveViewMutation,
  useUpdateViewMutation,
} from "@/features/views/api-slice";
import { useRouter } from "next/router";
import { useUpdateColumn } from "@/features/views/hooks";
import BackButton from "@/features/records/components/BackButton";
import ColumnsConfigurator from "@/features/views/components/ColumnsConfigurator";
import DefaultOrderConfigurator from "@/features/views/components/DefaultOrderConfigurator";
import FieldTypeOption from "@/features/views/components/FieldTypeOption";
import FiltersConfigurator from "@/features/views/components/FiltersConfigurator";
import GenericBooleanOption from "@/features/views/components/GenericBooleanOption";
import GenericTextOption from "@/features/views/components/GenericTextOption";
import Layout from "@/components/Layout";
import NullableOption from "@/features/views/components/NullableOption";
import PageWrapper from "@/components/PageWrapper";
import React, { useEffect, useMemo, useState } from "react";
import RecordsTable from "@/features/tables/components/RecordsTable";
import TinyLabel from "@/components/TinyLabel";
import VisibilityOption from "@/features/views/components/VisibilityOption";
import dynamic from "next/dynamic";

const getDynamicInspector = (fieldType: string) => {
  try {
    return dynamic(
      () => {
        try {
          // return the Inspector component if found
          return import(`@/plugins/fields/${fieldType}/Inspector.tsx`);
        } catch (error) {
          // return empty component
          return Promise.resolve(() => null);
        }
      },
      {
        // eslint-disable-next-line react/display-name
        loading: ({ isLoading }: { isLoading?: boolean }) =>
          isLoading ? <div className="px-4">Loading...</div> : null,
      }
    );
  } catch (error) {
    return () => "";
  }
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

  const [deleteColumn] = useDeleteColumnMutation();
  // const [createColumn, { isLoading: isCreating }] = useCreateColumnMutation();

  const deleteField = async (columnName: string) => {
    if (confirm("Are you sure you want to remove this virtual field?")) {
      await deleteColumn({
        viewId,
        columnName,
      });
    }
  };

  const InspectorComponent: any = useMemo(() => {
    if (!column) return (...rest: any) => "";

    return getDynamicInspector(column?.fieldType);
  }, [column?.fieldType]);

  const isComputed = useMemo(
    () => column?.baseOptions?.computed === true,
    [column]
  );

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

                <FiltersConfigurator />
                <DefaultOrderConfigurator />
                <ColumnsConfigurator />
              </div>
            )}
          </div>
          <div className="relative flex-1 flex h-full max-w-3/4 w-3/4">
            {column && (
              <div className="block space-y-6 py-4 w-1/3 border-r">
                <FieldTypeOption />

                {isComputed && (
                  <GenericTextOption
                    label="Computed value"
                    helpText="Value that has to be computed. You have to refresh the page after changing this value."
                    optionKey="baseOptions.computedSource"
                    placeholder="Label value"
                    defaultValue={column?.baseOptions?.computedSource}
                    formHelperText={
                      <>
                        You can use <Code size="sm">record</Code> in your query.
                      </>
                    }
                  />
                )}

                {/* @todo: make sure this works ok */}
                <InspectorComponent
                  column={column}
                  setColumnOptions={setColumnOptions}
                />
                {!isComputed && (
                  <GenericBooleanOption
                    label="Disconnect field"
                    helpText={
                      <>
                        Some fields you don't want to show at all. By
                        disconnecting the field it will be hidden from all views
                        and <strong>all responses</strong>.
                      </>
                    }
                    optionKey="baseOptions.disconnected"
                    checkboxLabel="Disconnect field"
                    isChecked={column.baseOptions.disconnected === true}
                  />
                )}
                <GenericTextOption
                  label="Label"
                  helpText="We are trying to find a good human name for your DB column, but if you want to change it, you can do it here. The label is reflected on Index (table header), Show, Edit and Create views."
                  optionKey="baseOptions.label"
                  placeholder="Label value"
                  defaultValue={column?.baseOptions?.label}
                  formHelperText={
                    <>
                      Original name for this field is <Code>{column.name}</Code>
                      .
                    </>
                  }
                />
                <GenericTextOption
                  helpText={
                    <>
                      You may use any html and hex color. <br /> We provide very
                      good defaults for the following colors <Code>blue</Code>,{" "}
                      <Code>red</Code>, <Code>green</Code>, <Code>yellow</Code>,{" "}
                      <Code>orange</Code>, <Code>pink</Code>,{" "}
                      <Code>purple</Code> and <Code>gray</Code>.
                    </>
                  }
                  label="Background color"
                  optionKey="baseOptions.backgroundColor"
                  placeholder="{{ value.toLowerCase().includes('ok') ? 'green' : 'yellow'}}"
                  className="font-mono w-full"
                  defaultValue={column?.baseOptions?.backgroundColor}
                  formHelperText={
                    <>
                      You can use the <Code>value</Code> variable.
                    </>
                  }
                />

                <VisibilityOption />

                {isComputed && (
                  <div className="flex justify-end px-2">
                    <Button
                      colorScheme="red"
                      size="xs"
                      variant="outline"
                      onClick={() => deleteField(column.name)}
                      leftIcon={<TrashIcon className="h-4" />}
                    >
                      Remove field
                    </Button>
                  </div>
                )}

                {!isComputed && (
                  <>
                    <div className="!-mb-2">
                      <div className="uppercase text-sm font-bold px-2 mt-4 mb-1">
                        Form options
                      </div>
                      <hr className="mt-0 mb-2" />
                    </div>{" "}
                    {!["Id", "DateTime"].includes(column.fieldType) && (
                      <GenericTextOption
                        helpText="Default value for create view."
                        label="Default value"
                        optionKey="baseOptions.defaultValue"
                        placeholder="Default value"
                        defaultValue={column?.baseOptions?.defaultValue}
                      />
                    )}
                    <GenericTextOption
                      label="Placeholder"
                      helpText="Whatever you pass in here will be a short hint that describes the expected value of this field."
                      optionKey="baseOptions.placeholder"
                      placeholder="Placeholder value"
                      defaultValue={column?.baseOptions?.placeholder}
                    />
                    <GenericTextOption
                      helpText="Does this field need to display some help text to your users? Write it here and they will see it."
                      label="Help text"
                      optionKey="baseOptions.help"
                      placeholder="Help text value"
                      defaultValue={column?.baseOptions?.help}
                    />
                    <GenericBooleanOption
                      helpText="Should this field be required in forms?"
                      label="Required"
                      optionKey="baseOptions.required"
                      checkboxLabel="Required"
                      isChecked={column.baseOptions.required === true}
                      isDisabled={
                        column.baseOptions.nullable === true ||
                        column.baseOptions.readonly === true
                      }
                    />
                    <GenericBooleanOption
                      label="Readonly"
                      helpText="Should this field be readonly in forms?"
                      optionKey="baseOptions.readonly"
                      checkboxLabel="Readonly"
                      isChecked={column.baseOptions.readonly === true}
                      isDisabled={column.baseOptions.required === true}
                    />
                    <NullableOption />
                  </>
                )}
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

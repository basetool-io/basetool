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
import GenericBooleanOption from "@/features/views/components/GenericBooleanOption";
import GenericTextOption from "@/features/views/components/GenericTextOption";
import Layout from "@/components/Layout";
import NullableOption from "@/features/views/components/NullableOption";
import PageWrapper from "@/components/PageWrapper";
import PlaceholderOption from "@/features/views/components/PlaceholderOption";
import React, { useEffect, useMemo, useState } from "react";
import RecordsTable from "@/features/tables/components/RecordsTable";
import TinyLabel from "@/components/TinyLabel";
import VisibilityOption from "@/features/views/components/VisibilityOption";
import dynamic from "next/dynamic";
import { useUpdateColumn } from "@/features/views/hooks"

const getDynamicInspector = (fieldType: string) => {
  try {
    return dynamic(
      () => {
        try {
          // return the Inspector component if found
          return import(`@/plugins/fields/${fieldType}/Inspector.tsx`);
        } catch (error) {
          // return empty component
          return Promise.resolve(() => "");
        }
      },
      {
        // eslint-disable-next-line react/display-name
        loading: ({ isLoading }: { isLoading?: boolean }) =>
          isLoading ? <p>Loading...</p> : null,
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
  const { viewId, dataSourceId, tableName } = useDataSourceContext();
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

  const InspectorComponent: any = useMemo(() => {
    if (!activeColumn) return (...rest: any) => "";

    return getDynamicInspector(activeColumn?.fieldType);
  }, [activeColumn?.fieldType]);


  const { column, setColumnOptions } = useUpdateColumn();

  const isComputed = useMemo(
    () => activeColumn?.baseOptions?.computed === true,
    [activeColumn]
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
              <div className="block space-y-6 py-4 w-1/3">
                <FieldTypeOption />

                {/* @todo: make sure this works ok */}
                <InspectorComponent
                  column={activeColumn}
                  setColumnOptions={setColumnOptions}
                />
                {!isComputed && (
                  <GenericBooleanOption
                    helpText={<>
                      Some fields you don't want to show at all. By
                      disconnecting the field it will be hidden from all views
                      and <strong>all responses</strong>.
                    </>}
                    label="Disconnect field"
                    optionKey="baseOptions.disconnected"
                    checkboxLabel="Disconnect field"
                    isChecked={activeColumn.baseOptions.disconnected === true}
                  />
                )}
                <GenericTextOption
                  helpText="We are trying to find a good human name for your DB column, but if you want to change it, you can do it here. The label is reflected on Index (table header), Show, Edit and Create views."
                  label="Label"
                  optionKey="baseOptions.label"
                  placeholder="Label value"
                  defaultValue={activeColumn?.baseOptions?.label}
                  formHelperText={
                    <>
                      Original name for this field is{" "}
                      <Code>{activeColumn.name}</Code>.
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
                  defaultValue={activeColumn?.baseOptions?.backgroundColor}
                  formHelperText={
                    <>
                      You can use the <Code>value</Code> variable.
                    </>
                  }
                />

                <GenericTextOption
                  helpText="Does this field need to display some help text to your users? Write it here and they will see it."
                  label="Help text"
                  optionKey="baseOptions.help"
                  placeholder="Help text value"
                  defaultValue={activeColumn?.baseOptions?.help}
                />

                {activeColumn.fieldType === "DateTime" ||
                  activeColumn.fieldType === "Id" || (
                    <GenericTextOption
                      helpText="Default value for create view."
                      label="Default value"
                      optionKey="baseOptions.defaultValue"
                      placeholder="Default value"
                      defaultValue={activeColumn?.baseOptions?.defaultValue}
                    />
                  )}

                {/* <OptionWrapper
      helpText={`We are trying to find a good human name for your DB column, but if you want to change it, you can do it here. The label is reflected on Index (table header), Show, Edit and Create views.`}
      id="label"
      label="Label"
    >
      <Input
        type="text"
        name="label value"
        placeholder="Label value"
        required={false}
        value={value}
        onChange={updateValue}
      />
      <FormHelperText>
        Original name for this field is <Code>{column.name}</Code>.
      </FormHelperText>

       */}
                {/* @todo: one toggle for all visibility */}
                <VisibilityOption />
                <div>
                  Edit view
                  <hr />
                  <PlaceholderOption />
                  <GenericBooleanOption
                    helpText="Should this field be required in forms?"
                    label="Required"
                    optionKey="baseOptions.required"
                    checkboxLabel="Required"
                    isChecked={activeColumn.baseOptions.required === true}
                    isDisabled={
                      activeColumn.baseOptions.nullable === true ||
                      activeColumn.baseOptions.readonly === true
                    }
                  />
                  <GenericBooleanOption
                    helpText="Should this field be readonly in forms?"
                    label="Readonly"
                    optionKey="baseOptions.readonly"
                    checkboxLabel="Readonly"
                    isChecked={activeColumn.baseOptions.readonly === true}
                    isDisabled={activeColumn.baseOptions.required === true}
                  />
                  <NullableOption />
                </div>
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

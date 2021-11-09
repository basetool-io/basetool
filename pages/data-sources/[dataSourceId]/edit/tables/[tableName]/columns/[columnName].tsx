import { BaseOptions, Column } from "@/features/fields/types";
import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { INITIAL_NEW_COLUMN } from "@/features/data-sources";
import { PlusIcon, TrashIcon } from "@heroicons/react/outline";
import { Save } from "react-feather";
import { diff as difference } from "deep-object-diff";
import {
  first,
  isArray,
  isEmpty,
  isUndefined,
  snakeCase,
} from "lodash";
import { getColumnOptions } from "@/features/fields";
import {
  useCreateColumnMutation,
  useDeleteColumnMutation,
  useGetColumnsQuery,
  useUpdateColumnMutation,
} from "@/features/tables/api-slice";
import { useDataSourceContext, useSegment } from "@/hooks";
import { useGetDataSourceQuery } from "@/features/data-sources/api-slice";
import { useRouter } from "next/router";
import OptionWrapper from "@/features/views/components/OptionsWrapper";
import React, { useEffect, useMemo, useState } from "react";
import TableColumnsEditLayout from "@/features/data-sources/components/TableColumnsEditLayout";
import dynamic from "next/dynamic";

type ChangesObject = Record<string, unknown>;

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

const NULL_VALUES = [
  {
    value: "",
    label: "'' (empty string)",
  },
  {
    value: "null",
    label: "'null' (as a string)",
  },
  {
    value: "0",
    label: "0",
  },
];

function ColumnEdit() {
  const router = useRouter();
  const { dataSourceId, tableName } = useDataSourceContext();
  const columnName = router.query.columnName as string;

  const isCreateField = useMemo(
    () => columnName === INITIAL_NEW_COLUMN.name,
    [columnName]
  );

  const [createName, setCreateName] = useState<string>();

  const { data: dataSourceResponse } = useGetDataSourceQuery(
    { dataSourceId },
    {
      skip: !dataSourceId,
    }
  );

  const setColumnOptions = async (
    column: Column,
    options: Record<string, unknown>
  ) => {
    track("Set the column options", {
      columnName: column.name,
      optionNames: Object.keys(options),
    });
    let namespace: "baseOptions" | "fieldOptions" | undefined;
    let newColumn: Column = column;

    Object.entries(options).forEach(([key, value]) => {
      const segments = key.split(".");
      if (segments && segments.length === 2) {
        namespace = segments[0] as "baseOptions" | "fieldOptions";
        key = segments[1];
      }

      if (namespace) {
        newColumn = {
          ...column,
          [namespace]: {
            ...column[namespace],
            [key]: value,
          },
        };
      } else {
        newColumn = {
          ...column,
          [key]: value,
        };
      }
      column = newColumn;
    });

    setLocalColumn(newColumn);
  };

  const { data: columnsResponse } = useGetColumnsQuery(
    {
      dataSourceId,
      tableName,
    },
    { skip: !dataSourceId || !tableName }
  );

  const column = useMemo(() => {
    if (columnsResponse?.ok && isArray(columnsResponse?.data)) {
      return columnsResponse.data.find(({ name }: any) => name === columnName);
    }
  }, [columnsResponse, columnName]);

  const [localColumn, setLocalColumn] = useState<Column>();

  const isComputed = useMemo(
    () => column?.baseOptions?.computed === true,
    [column]
  );

  useEffect(() => {
    setLocalColumn(column);
  }, [column]);

  const columnOptions = useMemo(() => {
    if (column) {
      return getColumnOptions(column);
    } else {
      return [];
    }
  }, [column]);
  const track = useSegment();

  const InspectorComponent: any = useMemo(() => {
    if (!localColumn) return (...rest: any) => "";

    return getDynamicInspector(localColumn?.fieldType);
  }, [localColumn?.fieldType]);

  // make nullable false when required is true (and vice versa) because they cannot be both true in the same time
  useEffect(() => {
    if (localColumn && localColumn.baseOptions.required) {
      setColumnOptions(localColumn, {
        "baseOptions.nullable": false,
        "baseOptions.readOnly": false,
      });
    }

    if (localColumn && localColumn.baseOptions.readonly) {
      setColumnOptions(localColumn, { "baseOptions.required": false });
    }

    if (localColumn && localColumn.baseOptions.nullable) {
      setColumnOptions(localColumn, { "baseOptions.required": false });

      if (isEmpty(localColumn.baseOptions.nullValues)) {
        setColumnOptions(localColumn, { "baseOptions.nullValues": [""] });
      }
    }
  }, [
    localColumn?.baseOptions?.required,
    localColumn?.baseOptions?.nullable,
    localColumn?.baseOptions?.readonly,
  ]);

  const diff = useMemo(() => {
    if (!localColumn) return {};

    return difference(column, localColumn);
  }, [column, localColumn]);

  const changes: ChangesObject[] = useMemo(() => {
    const changesObject: any = {};

    return first(
      Object.entries(diff).map(
        ([columnIndex, columnChanges]: [string, any]) => {
          if (!column || !localColumn) return [];

          if ("baseOptions" === columnIndex) {
            // Set the baseOptions
            Object.entries(columnChanges).forEach(([key]) => {
              if (
                !isUndefined(localColumn?.baseOptions[key as keyof BaseOptions])
              ) {
                changesObject.baseOptions = {
                  ...changesObject.baseOptions,
                  [key]: localColumn?.baseOptions[key as keyof BaseOptions],
                };
              }
            });
          } else if ("fieldOptions" === columnIndex) {
            // Set the fieldOptions
            Object.entries(columnChanges).forEach(([key]) => {
              if (!isUndefined(localColumn?.fieldOptions[key])) {
                changesObject.fieldOptions = {
                  ...changesObject.fieldOptions,
                  [key]: localColumn?.fieldOptions[key],
                };
              }
            });
          } else {
            // Set the regular options
            if (!isUndefined(localColumn[columnIndex as keyof Column])) {
              changesObject[columnIndex] =
                localColumn[columnIndex as keyof Column];
            }
          }

          return changesObject;
        }
      )
    );
  }, [column, diff]);

  const isDirty = useMemo(() => !isEmpty(changes), [changes]);

  const isValid = useMemo(() => {
    // We have to make sure the new name is unique, so we have to check for this.
    let allColumnNames = [];
    if (columnsResponse?.ok && isArray(columnsResponse?.data)) {
      allColumnNames = columnsResponse.data.map(({ name }: any) => name);
    }

    return !(
      allColumnNames.includes(snakeCase(createName)) ||
      snakeCase(createName) === INITIAL_NEW_COLUMN.name ||
      snakeCase(createName) === ""
    );
  }, [createName]);

  const [
    updateTable, // This is the mutation trigger
    { isLoading: isUpdating }, // This is the destructured mutation result
  ] = useUpdateColumnMutation();

  const saveTableSettings = async () => {
    await updateTable({
      dataSourceId,
      tableName,
      columnName,
      body: { changes },
    }).unwrap();
  };

  const [deleteColumn, { isLoading: isDeleting }] = useDeleteColumnMutation();
  const [createColumn, { isLoading: isCreating }] = useCreateColumnMutation();

  const deleteField = async () => {
    if (confirm("Are you sure you want to remove this field?")) {
      await deleteColumn({
        dataSourceId,
        tableName,
        columnName,
      });
      await router.push(
        `/data-sources/${dataSourceId}/edit/tables/${tableName}/columns`
      );
    }
  };

  const createField = async () => {
    const newColumn = {
      ...INITIAL_NEW_COLUMN,
      name: snakeCase(createName),
      label: createName,
      baseOptions: {
        ...INITIAL_NEW_COLUMN.baseOptions,
        label: createName,
      },
    };
    const response = await createColumn({
      dataSourceId,
      tableName,
      body: newColumn,
    });

    if ((response as any)?.data?.ok) {
      setCreateName(INITIAL_NEW_COLUMN.label);
      await router.push(
        `/data-sources/${dataSourceId}/edit/tables/${tableName}/columns/${snakeCase(
          createName
        )}`
      );
    }
  };

  return (
    <TableColumnsEditLayout
      crumbs={[
        dataSourceResponse?.data.name,
        "Edit",
        tableName,
        "Columns",
        columnName,
      ]}
      footerElements={{
        left: "",
        center: (
          <Button
            className="text-red-600 text-sm cursor-pointer"
            colorScheme="blue"
            size="sm"
            width="300px"
            leftIcon={
              isCreateField ? (
                <PlusIcon className="h-4" />
              ) : (
                <Save className="h-4" />
              )
            }
            isLoading={isCreating || isUpdating}
            disabled={isCreateField ? !isValid : !isDirty}
            onClick={isCreateField ? createField : saveTableSettings}
          >
            {isCreateField ? "Create field" : "Save settings"}
          </Button>
        ),
      }}
    >
      <>
        {!isCreateField && localColumn && (
          <div className="w-full">
            <div className="flex justify-between">
              <h3 className="uppercase text-md font-semibold">Field options</h3>
              {isComputed && (
                <Button
                  colorScheme="red"
                  size="xs"
                  variant="outline"
                  onClick={() => !isDeleting && deleteField()}
                  isLoading={isDeleting}
                  leftIcon={<TrashIcon className="h-4" />}
                >
                  Remove field
                </Button>
              )}
            </div>
            <div className="divide-y">
              {/* <OptionWrapper
                helpText="We try to infer the type of field from your data source.
                Sometimes we might not get it right the first time. Choose the appropiate type of field
                from these options"
              >
                <FormControl id="fieldType">
                  <FormLabel>Field Type</FormLabel>
                  <Select
                    value={localColumn.fieldType}
                    onClick={() => {
                      track("Clicked the field type selector");
                    }}
                    onChange={(e) => {
                      setColumnOptions(localColumn, {
                        fieldType: e.currentTarget.value as FieldType,
                      });
                      track("Changed the field type selector");
                    }}
                  >
                    <option disabled>Select field type</option>
                    {columnOptions &&
                      columnOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                  </Select>
                </FormControl>
              </OptionWrapper> */}

              {isComputed && (
                <OptionWrapper helpText="Value that has to be computed. You have to refresh the page after changing this value.">
                  <FormControl id="computedSource">
                    <FormLabel>Value</FormLabel>
                    <Input
                      type="text"
                      name="value"
                      placeholder="{{record.first_name}} {{record.last_name}}"
                      className="font-mono"
                      required={true}
                      value={localColumn?.baseOptions?.computedSource}
                      onChange={(e) => {
                        setColumnOptions(localColumn, {
                          "baseOptions.computedSource": e.currentTarget.value,
                        });
                      }}
                    />
                    <FormHelperText>
                      We are using{" "}
                      <a
                        className="text-blue-600"
                        href="https://handlebarsjs.com/"
                        target="_blank"
                        rel="noreferrer"
                      >
                        handlebars
                      </a>{" "}
                      syntax for this.
                    </FormHelperText>
                  </FormControl>
                </OptionWrapper>
              )}
            </div>
          </div>
        )}
        {isCreateField && (
          <div className="w-full">
            <h3 className="uppercase text-md font-semibold">Add new field</h3>
            <div className="divide-y">
              <OptionWrapper helpText={"What should we call this field?"}>
                <FormControl id="label">
                  <FormLabel>Label</FormLabel>
                  <Input
                    type="text"
                    name="label value"
                    placeholder="Label value"
                    required={false}
                    value={createName}
                    onChange={(e) => setCreateName(e.currentTarget.value)}
                  />
                </FormControl>
              </OptionWrapper>
            </div>
          </div>
        )}
      </>
    </TableColumnsEditLayout>
  );
}

export default ColumnEdit;

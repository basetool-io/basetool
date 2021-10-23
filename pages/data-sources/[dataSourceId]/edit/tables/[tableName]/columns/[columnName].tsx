import { BaseOptions, Column, FieldType } from "@/features/fields/types";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Code,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Select,
  Stack,
} from "@chakra-ui/react";
import { PlusIcon, TrashIcon } from "@heroicons/react/outline";
import { Save } from "react-feather";
import { Views } from "@/features/fields/enums";
import { diff as difference } from "deep-object-diff";
import {
  first,
  isArray,
  isEmpty,
  isUndefined,
  snakeCase,
  without,
} from "lodash";
import { getColumnNameLabel, getColumnOptions } from "@/features/fields";
import {
  useCreateColumnMutation,
  useDeleteColumnMutation,
  useGetColumnsQuery,
  useUpdateColumnMutation,
} from "@/features/tables/api-slice";
import { useDataSourceContext, useSegment } from "@/hooks";
import { useGetDataSourceQuery } from "@/features/data-sources/api-slice";
import { useRouter } from "next/router";
import OptionWrapper from "@/features/tables/components/OptionsWrapper";
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

export const INITIAL_NEW_COLUMN = {
  name: "computed_field",
  label: "Computed field",
  primaryKey: false,
  baseOptions: {
    visibility: [Views.index, Views.show],
    required: false,
    nullable: false,
    nullValues: [],
    readonly: false,
    placeholder: "",
    help: "",
    label: "",
    disconnected: false,
    defaultValue: "",
    computed: true,
  },
  fieldType: "Text" as FieldType,
  fieldOptions: {
    value: "",
  },
};

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
      setColumnOptions(localColumn, { "baseOptions.nullable": false });
    }

    if (localColumn && localColumn.baseOptions.nullable) {
      setColumnOptions(localColumn, { "baseOptions.required": false });

      if (isEmpty(localColumn.baseOptions.nullValues)) {
        setColumnOptions(localColumn, { "baseOptions.nullValues": [""] });
      }
    }
  }, [localColumn?.baseOptions?.required, localColumn?.baseOptions?.nullable]);

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
              <h3 className="uppercase text-md font-semibold">
                {getColumnNameLabel(
                  column?.baseOptions?.label,
                  column?.label,
                  column?.name
                )}
              </h3>
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
              <OptionWrapper
                helpText="We try to infer the type of field from your data source.
                Sometimes we make mistakes. Choose the appropiate type of field
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
              </OptionWrapper>

              <InspectorComponent
                column={localColumn}
                setColumnOptions={setColumnOptions}
              />

              {!isComputed && (
                <OptionWrapper
                  helpText={
                    <>
                      Some fields you don't want to show at all. By
                      disconnecting the field it will be hidden from all views
                      and <strong>all responses</strong>.
                    </>
                  }
                >
                  <FormLabel>Disconnect field</FormLabel>
                  <Checkbox
                    isChecked={localColumn.baseOptions.disconnected}
                    onChange={() => {
                      track("Clicked the disconnect field option");

                      return setColumnOptions(localColumn, {
                        "baseOptions.disconnected":
                          !localColumn.baseOptions.disconnected,
                      });
                    }}
                  >
                    Disconnected
                  </Checkbox>
                </OptionWrapper>
              )}

              <OptionWrapper
                helpText={`By default, all fields are visible in all views.
But maybe some shouldn't be? 🤔
You can control where the field is visible here.`}
              >
                <CheckboxGroup
                  value={localColumn.baseOptions.visibility}
                  onChange={(value) => {
                    setColumnOptions(localColumn, {
                      "baseOptions.visibility": value,
                    });
                  }}
                >
                  <Stack direction="column">
                    <Checkbox
                      value="index"
                      isDisabled={localColumn.baseOptions.disconnected}
                    >
                      Index
                    </Checkbox>
                    <Checkbox
                      value="show"
                      isDisabled={localColumn.baseOptions.disconnected}
                    >
                      Show
                    </Checkbox>
                    {!isComputed && (
                      <>
                        <Checkbox
                          value="edit"
                          isDisabled={localColumn.baseOptions.disconnected}
                        >
                          Edit
                        </Checkbox>
                        <Checkbox
                          value="new"
                          isDisabled={localColumn.baseOptions.disconnected}
                        >
                          New
                        </Checkbox>
                      </>
                    )}
                  </Stack>
                </CheckboxGroup>
              </OptionWrapper>

              <OptionWrapper
                helpText={`We are trying to find a good human name for your DB column, but if you want to change it, you can do it here. The label is reflected on Index (table header), Show, Edit and Create views.`}
              >
                <FormControl id="label">
                  <FormLabel>Label</FormLabel>
                  <Input
                    type="text"
                    name="label value"
                    placeholder="Label value"
                    required={false}
                    value={localColumn.baseOptions.label}
                    onChange={(e) =>
                      setColumnOptions(localColumn, {
                        "baseOptions.label": e.currentTarget.value,
                      })
                    }
                  />
                  <FormHelperText>
                    Original name for this field is{" "}
                    <Code>{localColumn.name}</Code>.
                  </FormHelperText>
                </FormControl>
              </OptionWrapper>

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

              {!isComputed && (
                <>
                  <OptionWrapper
                    helpText={`Whatever you pass in here will be a short hint that describes the expected value of this field.`}
                  >
                    <FormControl id="placeholder">
                      <FormLabel>Placeholder</FormLabel>
                      <Input
                        type="text"
                        name="placeholder value"
                        placeholder="Placeholder value"
                        required={false}
                        value={localColumn.baseOptions.placeholder}
                        onChange={(e) =>
                          setColumnOptions(localColumn, {
                            "baseOptions.placeholder": e.currentTarget.value,
                          })
                        }
                      />
                    </FormControl>
                  </OptionWrapper>

                  <OptionWrapper
                    helpText={`Should this field be required in forms?`}
                  >
                    <FormControl id="required">
                      <FormLabel>Required</FormLabel>
                      <Checkbox
                        id="required"
                        isChecked={localColumn.baseOptions.required === true}
                        isDisabled={localColumn.baseOptions.nullable === true}
                        onChange={() =>
                          setColumnOptions(localColumn, {
                            "baseOptions.required":
                              !localColumn.baseOptions.required,
                          })
                        }
                      >
                        Required
                      </Checkbox>
                    </FormControl>
                  </OptionWrapper>

                  <OptionWrapper
                    helpText={`There are cases where you may prefer to explicitly instruct Basetool to store a NULL value in the database row when the field is empty.`}
                  >
                    <FormControl id="nullable">
                      <FormLabel>Nullable</FormLabel>
                      <Checkbox
                        id="nullable"
                        isChecked={localColumn.baseOptions.nullable}
                        isDisabled={localColumn.baseOptions.required === true}
                        onChange={() =>
                          setColumnOptions(localColumn, {
                            "baseOptions.nullable":
                              !localColumn.baseOptions.nullable,
                          })
                        }
                      >
                        Nullable
                      </Checkbox>
                      {localColumn?.dataSourceInfo?.nullable === false && (
                        <FormHelperText>
                          Has to be nullable in the DB in order to use this
                          option.
                        </FormHelperText>
                      )}
                    </FormControl>
                    {localColumn.baseOptions.nullable === true && (
                      <Stack pl={6} mt={1} spacing={1}>
                        {NULL_VALUES &&
                          NULL_VALUES.map(({ value, label }) => (
                            <div key={label}>
                              <Checkbox
                                id={`null_value_${label}`}
                                isChecked={Object.values(
                                  localColumn.baseOptions.nullValues
                                ).includes(value)}
                                onChange={(e) => {
                                  let newNullValues = Object.values({
                                    ...localColumn.baseOptions.nullValues,
                                  });

                                  if (e.currentTarget.checked)
                                    newNullValues.push(value);
                                  else
                                    newNullValues = without(
                                      newNullValues,
                                      value
                                    );

                                  setColumnOptions(localColumn, {
                                    "baseOptions.nullValues": newNullValues,
                                  });
                                }}
                              >
                                {label}
                              </Checkbox>
                            </div>
                          ))}
                      </Stack>
                    )}
                  </OptionWrapper>

                  <OptionWrapper
                    helpText={`Does this field need to display some help text to your users? Write it here and they will see it.`}
                  >
                    <FormControl id="help">
                      <FormLabel>Help text</FormLabel>
                      <Input
                        type="text"
                        name="help value"
                        placeholder="Help text value"
                        required={false}
                        value={localColumn.baseOptions.help}
                        onChange={(e) =>
                          setColumnOptions(localColumn, {
                            "baseOptions.help": e.currentTarget.value,
                          })
                        }
                      />
                    </FormControl>
                  </OptionWrapper>

                  {localColumn.fieldType === "DateTime" ||
                    localColumn.fieldType === "Id" || (
                      <OptionWrapper
                        helpText={`Default value for create view.`}
                      >
                        <FormControl id="defaultValue">
                          <FormLabel>Default value</FormLabel>
                          <Input
                            type="text"
                            name="default value"
                            placeholder="Default value"
                            required={false}
                            value={localColumn.baseOptions.defaultValue}
                            onChange={(e) =>
                              setColumnOptions(localColumn, {
                                "baseOptions.defaultValue":
                                  e.currentTarget.value,
                              })
                            }
                          />
                        </FormControl>
                      </OptionWrapper>
                    )}
                </>
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

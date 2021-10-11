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
import { Save } from "react-feather";
import { diff as difference } from "deep-object-diff";
import { first, isArray, isEmpty, isUndefined, without } from "lodash";
import { getColumnNameLabel, getColumnOptions } from "@/features/fields";
import {
  useGetColumnsQuery,
  useUpdateColumnMutation,
} from "@/features/tables/api-slice";
import { useGetDataSourceQuery } from "@/features/data-sources/api-slice";
import { useRouter } from "next/router";
import { useSegment } from "@/hooks";
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

function ColumnEdit() {
  const router = useRouter();
  const dataSourceId = router.query.dataSourceId as string;
  const tableName = router.query.tableName as string;
  const columnName = router.query.columnName as string;

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
  const [
    updateTable, // This is the mutation trigger
    { isLoading: isUpdating }, // This is the destructured mutation result
  ] = useUpdateColumnMutation();

  const saveTableSettings = async () => {
    await updateTable({
      dataSourceId: router.query.dataSourceId as string,
      tableName: router.query.tableName as string,
      columnName: router.query.columnName as string,
      body: { changes },
    }).unwrap();
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
            leftIcon={<Save className="h-4" />}
            isLoading={isUpdating}
            disabled={!isDirty}
            onClick={saveTableSettings}
          >
            Save column settings
          </Button>
        ),
      }}
    >
      <>
        {localColumn && (
          <div className="w-full">
            <h3 className="uppercase text-md font-semibold">
              {getColumnNameLabel(
                column?.baseOptions?.label,
                column?.label,
                column?.name
              )}
            </h3>
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

              <OptionWrapper
                helpText={
                  <>
                    Some fields you don't want to show at all. By disconnecting
                    the field it will be hidden from all views and{" "}
                    <strong>all responses</strong>.
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

              <OptionWrapper
                helpText={`By default, all fields are visible in all views.
But maybe some shouldn't be? 🤔
You can control where the field is visible here.`}
              >
                <CheckboxGroup
                  value={localColumn.baseOptions.visibility}
                  onChange={(value) =>
                    setColumnOptions(localColumn, {
                      "baseOptions.visibility": value,
                    })
                  }
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
                  {localColumn.dataSourceInfo.nullable === false && (
                    <FormHelperText>
                      Has to be nullable in the DB in order to use this option.
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
                                newNullValues = without(newNullValues, value);

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
                  <OptionWrapper helpText={`Default value for create view.`}>
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
                            "baseOptions.defaultValue": e.currentTarget.value,
                          })
                        }
                      />
                    </FormControl>
                  </OptionWrapper>
                )}
            </div>
          </div>
        )}
      </>
    </TableColumnsEditLayout>
  );
}

export default ColumnEdit;

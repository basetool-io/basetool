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
import { Column, FieldType } from "@/features/fields/types";
import { PlusIcon } from "@heroicons/react/outline";
import { Save } from "react-feather";
import { Views } from "@/features/fields/enums";
import { diff as difference } from "deep-object-diff";
import {
  getColumnNameLabel,
  getColumnOptions,
  iconForField,
} from "@/features/fields";
import { isEmpty, without } from "lodash";
import { useBoolean } from "react-use";
import {
  useCreateColumnMutation,
  useDeleteColumnMutation,
  useGetColumnsQuery,
  useUpdateColumnsMutation,
} from "@/features/tables/api-slice";
import { useRouter } from "next/router";
import BackButton from "@/features/records/components/BackButton";
import ColumnListItem from "@/components/ColumnListItem";
import Layout from "@/components/Layout";
import LoadingOverlay from "@/components/LoadingOverlay";
import OptionWrapper from "@/features/tables/components/OptionsWrapper";
import PageWrapper from "@/components/PageWrapper";
import React, { useEffect, useMemo, useState } from "react";
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

const INITIAL_NEW_COLUMN = {
  name: "new_computed_field",
  label: "",
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
  fieldType: "Computed" as FieldType,
  fieldOptions: {
    value: "",
  },
};

const ColumnEditor = ({
  column,
  setColumnOptions,
  setCreateName,
}: {
  column: Column;
  setColumnOptions: (c: Column, options: Record<string, unknown>) => void;
  setCreateName?: (name: string) => void;
}) => {
  const isCreateField = column.name === INITIAL_NEW_COLUMN.name;
  const [newColumnName, setNewColumnName] = useState(column.name);

  const columnOptions = useMemo(() => {
    if (column) {
      return getColumnOptions(column);
    } else {
      return [];
    }
  }, [column]);

  const InspectorComponent = useMemo(
    () =>
      getDynamicInspector(column?.fieldType) as React.ComponentType<{
        column: Column;
        setColumnOptions: (c: Column, options: Record<string, unknown>) => void;
      }>,
    [column?.fieldType]
  );

  // make nullable false when required is true (and vice versa) because they cannot be both true in the same time
  useEffect(() => {
    if (column.baseOptions.required) {
      setColumnOptions(column, { "baseOptions.nullable": false });
    }
  }, [column.baseOptions.required]);

  useEffect(() => {
    if (column.baseOptions.nullable) {
      setColumnOptions(column, { "baseOptions.required": false });

      if (isEmpty(column.baseOptions.nullValues)) {
        setColumnOptions(column, { "baseOptions.nullValues": [""] });
      }
    }
  }, [column.baseOptions.nullable]);

  useEffect(() => {
    if (setCreateName) {
      setCreateName(newColumnName);
    }
  }, [newColumnName]);

  return (
    <>
      {!column?.name && "👈 Please select a field"}
      {column?.name && (
        <div className="w-full">
          <div>
            <h3 className="uppercase text-md font-semibold">
              {getColumnNameLabel(
                column?.baseOptions?.label,
                column?.label,
                column?.name
              )}
            </h3>
          </div>
          <div className="divide-y">
            {isCreateField && (
              <>
                <OptionWrapper helpText={"Give this column a name to remember"}>
                  <FormControl id="name">
                    <FormLabel>Name</FormLabel>
                    <Input
                      type="text"
                      name="name value"
                      placeholder="Name value"
                      required={false}
                      value={newColumnName}
                      onChange={(e) => setNewColumnName(e.currentTarget.value)}
                    />
                  </FormControl>
                </OptionWrapper>
              </>
            )}

            {isCreateField || (
              <>
                {column.fieldType !== "Computed" && (
                  <OptionWrapper
                    helpText="We try to infer the type of field from your data source.
                  Sometimes we make mistakes. Choose the appropiate type of field
                  from these options"
                  >
                    <FormControl id="fieldType">
                      <FormLabel>Field Type</FormLabel>
                      <Select
                        value={column.fieldType}
                        onChange={(e) => {
                          setColumnOptions(column, {
                            fieldType: e.currentTarget.value as FieldType,
                          });
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
                )}

                {column.fieldType !== "Computed" && (
                  <OptionWrapper
                    helpText={`Some fields you don't want to show at all. By disconnecting the field it will be hidden from all views.`}
                  >
                    <FormLabel>Disconnect field</FormLabel>
                    <Checkbox
                      isChecked={column.baseOptions.disconnected}
                      onChange={() =>
                        setColumnOptions(column, {
                          "baseOptions.disconnected":
                            !column.baseOptions.disconnected,
                        })
                      }
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
                    value={column.baseOptions.visibility}
                    onChange={(value) =>
                      setColumnOptions(column, {
                        "baseOptions.visibility": value,
                      })
                    }
                  >
                    <Stack direction="column">
                      <Checkbox
                        value="index"
                        isDisabled={column.baseOptions.disconnected}
                      >
                        Index
                      </Checkbox>
                      <Checkbox
                        value="show"
                        isDisabled={column.baseOptions.disconnected}
                      >
                        Show
                      </Checkbox>
                      {column.fieldType !== "Computed" && (
                        <>
                          <Checkbox
                            value="edit"
                            isDisabled={column.baseOptions.disconnected}
                          >
                            Edit
                          </Checkbox>
                          <Checkbox
                            value="new"
                            isDisabled={column.baseOptions.disconnected}
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
                      value={column.baseOptions.label}
                      onChange={(e) =>
                        setColumnOptions(column, {
                          "baseOptions.label": e.currentTarget.value,
                        })
                      }
                    />
                    <FormHelperText>
                      Original name for this field is <Code>{column.name}</Code>
                      .
                    </FormHelperText>
                  </FormControl>
                </OptionWrapper>

                {column.fieldType !== "Computed" && (
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
                          value={column.baseOptions.placeholder}
                          onChange={(e) =>
                            setColumnOptions(column, {
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
                          isChecked={column.baseOptions.required === true}
                          onChange={() =>
                            setColumnOptions(column, {
                              "baseOptions.required":
                                !column.baseOptions.required,
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
                          isChecked={column.baseOptions.nullable}
                          isDisabled={
                            column?.dataSourceInfo?.nullable === false
                          }
                          onChange={() =>
                            setColumnOptions(column, {
                              "baseOptions.nullable":
                                !column.baseOptions.nullable,
                            })
                          }
                        >
                          Nullable
                        </Checkbox>
                        {column?.dataSourceInfo?.nullable === false && (
                          <FormHelperText>
                            Has to be nullable in the DB in order to use this
                            option.
                          </FormHelperText>
                        )}
                      </FormControl>
                      {column.baseOptions.nullable === true && (
                        <Stack pl={6} mt={1} spacing={1}>
                          {NULL_VALUES &&
                            NULL_VALUES.map(({ value, label }) => (
                              <div key={label}>
                                <Checkbox
                                  id={`null_value_${label}`}
                                  isChecked={Object.values(
                                    column.baseOptions.nullValues
                                  ).includes(value)}
                                  onChange={(e) => {
                                    let newNullValues = Object.values({
                                      ...column.baseOptions.nullValues,
                                    });

                                    if (e.currentTarget.checked)
                                      newNullValues.push(value);
                                    else
                                      newNullValues = without(
                                        newNullValues,
                                        value
                                      );

                                    setColumnOptions(column, {
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
                          value={column.baseOptions.help}
                          onChange={(e) =>
                            setColumnOptions(column, {
                              "baseOptions.help": e.currentTarget.value,
                            })
                          }
                        />
                      </FormControl>
                    </OptionWrapper>

                    {column.fieldType === "DateTime" ||
                      column.fieldType === "Id" || (
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
                              value={column.baseOptions.defaultValue}
                              onChange={(e) =>
                                setColumnOptions(column, {
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

                <InspectorComponent
                  column={column}
                  setColumnOptions={setColumnOptions}
                />
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const FieldsEditor = ({ columns: initialColumns }: { columns: Column[] }) => {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [column, setColumn] = useState<Column>();
  const [addNewField, toggleAddNewField] = useBoolean(false);

  useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns]);

  const router = useRouter();
  const diff = useMemo(() => {
    return difference(initialColumns, columns);
  }, [initialColumns, columns]);
  const isDirty = useMemo(() => !isEmpty(diff), [diff]);
  const changes: ChangesObject = useMemo(() => {
    return Object.fromEntries(
      Object.entries(diff).map(([columnIndex, changes]: [string, any]) => {
        // get the column
        const column = columns[parseInt(columnIndex, 10)];

        if (!column) return [];

        // create the changes object
        const changesObject = {
          ...changes,
          // fieldType: column.fieldType,
          // Force visibility because the diff package does a weird diff on arrays.
          baseOptions: {
            ...changes.baseOptions,
            visibility: column.baseOptions.visibility,
          },
          fieldOptions: {
            ...changes.fieldOptions,
          },
        };

        return [column.name, changesObject];
      })
    );
  }, [columns, diff]);
  const [
    updateTable, // This is the mutation trigger
    { isLoading: isUpdating }, // This is the destructured mutation result
  ] = useUpdateColumnsMutation();

  const setColumnOptions = async (
    column: Column,
    options: Record<string, unknown>
  ) => {
    const newColumns = [...columns];
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

    const index = newColumns.findIndex((c: Column) => c.name === column.name);

    if (index > -1) {
      newColumns[index] = newColumn;
      await setColumn(newColumn);
      await setColumns(newColumns);
    }
  };

  const saveTableSettings = async () => {
    await updateTable({
      dataSourceId: router.query.dataSourceId as string,
      tableName: router.query.tableName as string,
      body: {
        changes,
      },
    });
  };

  useEffect(() => {
    if (columns.length > 0) setColumn(columns[0]);
  }, []);

  const backLink = `/data-sources/${router.query.dataSourceId}/tables/${router.query.tableName}`;

  const [deleteColumn, { isLoading: isDeleting }] = useDeleteColumnMutation();
  const [createColumn, { isLoading: isCreating }] = useCreateColumnMutation();

  const handleDeleteField = async () => {
    if (confirm("Are you sure you want to remove this field?")) {
      await deleteColumn({
        dataSourceId: router.query.dataSourceId as string,
        tableName: router.query.tableName as string,
        columnName: column?.name as string,
      });

      toggleAddNewField(true);
    }
  };

  const createField = async () => {
    const newColumn = { ...column, name: createName }
    const response = await createColumn({
      dataSourceId: router.query.dataSourceId as string,
      tableName: router.query.tableName as string,
      body: newColumn,
    });

    if ((response as any)?.data?.ok) {
      toggleAddNewField(false);
      setColumn(newColumn as Column)
    }
  };

  const allColumnNames = columns.map((column) => column.name);

  const [createName, setCreateName] = useState<string>(INITIAL_NEW_COLUMN.name);

  return (
    <>
      <PageWrapper
        heading={`Edit '${router.query.tableName}' table`}
        buttons={<BackButton href={backLink} />}
        flush={true}
        footer={
          <PageWrapper.Footer
            left={
              !addNewField &&
              column?.fieldType === "Computed" && (
                <a
                  className="text-red-600 text-sm cursor-pointer"
                  onClick={() => !isDeleting && handleDeleteField()}
                >
                  Remove field
                </a>
              )
            }
            center={
              <Button
                className="text-red-600 text-sm cursor-pointer"
                colorScheme="blue"
                size="sm"
                width="300px"
                leftIcon={
                  addNewField ? (
                    <PlusIcon className="h-4" />
                  ) : (
                    <Save className="h-4" />
                  )
                }
                isLoading={isCreating || isUpdating}
                disabled={
                  addNewField
                    ? allColumnNames.includes(createName) ||
                      createName === INITIAL_NEW_COLUMN.name ||
                      createName === ""
                    : !isDirty
                }
                onClick={addNewField ? createField : saveTableSettings}
              >
                {addNewField ? "Create field" : "Save settings"}
              </Button>
            }
          />
        }
      >
        <div className="relative flex-1 max-w-full w-full flex">
          <div className="flex flex-shrink-0 w-1/4 border-r">
            <div className="w-full relative p-4">
              <div className="mb-2">Fields</div>
              {columns &&
                columns.map((col) => {
                  const IconElement = iconForField(col);

                  return (
                    <ColumnListItem
                      key={col.name}
                      icon={
                        <IconElement className="h-4 mr-2 flex flex-shrink-0" />
                      }
                      active={col.name === column?.name && !addNewField}
                      onClick={() => {
                        setColumn(col);
                        toggleAddNewField(false);
                      }}
                    >
                      {getColumnNameLabel(
                        col.baseOptions.label,
                        col.label,
                        col.name
                      )}{" "}
                      {col.baseOptions.required && (
                        <sup className="text-red-600">*</sup>
                      )}
                    </ColumnListItem>
                  );
                })}
              <div className="mt-2">
                <ColumnListItem
                  active={addNewField}
                  icon={<PlusIcon className="h-4" />}
                  onClick={() => {
                    setColumn(INITIAL_NEW_COLUMN);
                    toggleAddNewField(true);
                  }}
                >
                  Add new field
                </ColumnListItem>
              </div>
            </div>
          </div>
          <div className="flex-1 p-4">
            {addNewField && (
              <>
                <ColumnEditor
                  column={INITIAL_NEW_COLUMN}
                  setColumnOptions={setColumnOptions}
                  setCreateName={setCreateName}
                />
              </>
            )}
            {addNewField || (
              <>
                {isUpdating && <LoadingOverlay />}
                {column && (
                  <ColumnEditor
                    column={column}
                    setColumnOptions={setColumnOptions}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </PageWrapper>
    </>
  );
};

function TablesEdit() {
  const router = useRouter();
  const dataSourceId = router.query.dataSourceId as string;
  const tableName = router.query.tableName as string;
  const { data, error, isFetching } = useGetColumnsQuery(
    {
      dataSourceId,
      tableName,
    },
    { skip: !dataSourceId || !tableName }
  );

  return (
    <Layout>
      {isFetching && <LoadingOverlay transparent={true} />}
      {error && <div>Error: {JSON.stringify(error)}</div>}
      {data?.ok && <FieldsEditor columns={data?.data} />}
    </Layout>
  );
}

export default TablesEdit;

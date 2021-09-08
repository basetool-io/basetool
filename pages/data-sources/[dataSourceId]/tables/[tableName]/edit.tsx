import {
  Button,
  ButtonGroup,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
} from "@chakra-ui/react";
import { Column, FieldType } from "@/features/fields/types";
import { diff as difference } from "deep-object-diff";
import { getColumnOptions } from "@/features/fields";
import { inDevelopment } from "@/lib/environment";
import { isEmpty } from "lodash";
import {
  useGetColumnsQuery,
  useUpdateColumnsMutation,
} from "@/features/tables/api-slice";
import { useRouter } from "next/router";
import BackButton from "@/features/records/components/BackButton";
import ColumnListItem from "@/features/tables/components/ColumnListItem";
import Layout from "@/components/Layout";
import LoadingOverlay from "@/components/LoadingOverlay";
import OptionWrapper from "@/features/tables/components/OptionsWrapper";
import PageWrapper from "@/features/records/components/PageWrapper";
import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

type ChangesObject = Record<string, unknown>;

const getDynamicInspector = (fieldType: string) => {
  try {
    return dynamic(
      () => {
        try {
          // return the Inspector component if found
          return import(`@/plugins/fields/${fieldType}/Inspector.tsx`)
        } catch (error) {
          // return empty component
          return Promise.resolve(() => '')
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

const ColumnEditor = ({
  column,
  setColumnOption,
}: {
  column: Column;
  setColumnOption: (c: Column, name: string, value: any) => void;
}) => {
  const columnOptions = useMemo(
    () => (column ? getColumnOptions(column) : []),
    [column]
  );

  const InspectorComponent = useMemo(
    () =>
      getDynamicInspector(column?.fieldType) as React.ComponentType<{
        column: Column;
        setColumnOption: (c: Column, name: string, value: any) => void;
      }>,
    [column?.fieldType]
  );

  return (
    <>
      {!column?.name && "👈 Please select a field"}
      {column?.name && (
        <div className="w-full">
          <div>
            <h3 className="uppercase text-md font-semibold">{column.name}</h3>
          </div>
          <div className="divide-y">
            <OptionWrapper
              helpText="We try to infer the type of field from your data source.
                Sometimes we make mistakes. Choose the appropiate type of field
                from these options"
            >
              <FormControl id="country">
                <FormLabel>Field Type</FormLabel>
                <Select
                  value={column.fieldType}
                  onChange={(e) => {
                    setColumnOption(
                      column,
                      "fieldType",
                      e.currentTarget.value as FieldType
                    );
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

            <OptionWrapper
              helpText={`By default, all fields are visible in all views.
But maybe some shouldn't be? 🤔
You can control where the field is visible here.`}
            >
              <CheckboxGroup
                value={column.baseOptions.visibility}
                onChange={(value) =>
                  setColumnOption(column, "baseOptions.visibility", value)
                }
              >
                <FormLabel>Visibility</FormLabel>
                <Stack direction="column">
                  <Checkbox value="index">Index</Checkbox>
                  <Checkbox value="show">Show</Checkbox>
                  <Checkbox value="edit">Edit</Checkbox>
                  <Checkbox value="new">New</Checkbox>
                </Stack>
              </CheckboxGroup>
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
                  value={column.baseOptions.placeholder}
                  onChange={(e) =>
                    setColumnOption(
                      column,
                      "baseOptions.placeholder",
                      e.currentTarget.value
                    )
                  }
                />
              </FormControl>
            </OptionWrapper>

            <OptionWrapper helpText={`Should this field be required in forms?`}>
              <FormControl id="required">
                <FormLabel>Required</FormLabel>
                <Checkbox
                  id="required"
                  isChecked={column.baseOptions.required === true}
                  onChange={() =>
                    setColumnOption(
                      column,
                      "baseOptions.required",
                      !column.baseOptions.required
                    )
                  }
                >
                  Required
                </Checkbox>
              </FormControl>
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
                    setColumnOption(
                      column,
                      "baseOptions.help",
                      e.currentTarget.value
                    )
                  }
                />
              </FormControl>
            </OptionWrapper>

            <InspectorComponent
              column={column}
              setColumnOption={setColumnOption}
            />
          </div>
        </div>
      )}
    </>
  );
};

const FieldsEditor = ({ columns: initialColumns }: { columns: Column[] }) => {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [column, setColumn] = useState<Column>();
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

  const setColumnOption = (column: Column, name: string, value: any) => {
    const newColumns = [...columns];
    let namespace: "baseOptions" | "fieldOptions" | undefined;
    let newColumn: Column;

    const segments = name.split(".");
    if (segments && segments.length === 2) {
      namespace = segments[0] as "baseOptions" | "fieldOptions";
      name = segments[1];
    }

    if (namespace) {
      newColumn = {
        ...column,
        [namespace]: {
          ...column[namespace],
          [name]: value,
        },
      };
    } else {
      newColumn = {
        ...column,
        [name]: value,
      };
    }

    const index = newColumns.findIndex((c: Column) => c.name === column.name);

    if (index > -1) {
      newColumns[index] = newColumn;
      setColumn(newColumn);
      setColumns(newColumns);
    }
  };

  const saveTableSettings = () => {
    updateTable({
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

  return (
    <>
      <PageWrapper
        heading={`Edit '${router.query.tableName}' table`}
        status={
          <>
            {inDevelopment && (
              <div className="text-xs inline-flex">
                {isDirty && "Dirty"}
                {!isDirty && "Clean"}
              </div>
            )}
          </>
        }
        buttons={
          <ButtonGroup size="sm">
            <BackButton href={backLink} />
            <Button
              colorScheme="blue"
              disabled={!isDirty}
              onClick={saveTableSettings}
            >
              Save
            </Button>
          </ButtonGroup>
        }
        flush={true}
      >
        <div className="relative flex-1 max-w-full w-full flex">
          <div className="flex flex-shrink-0 w-1/4 border-r">
            <div className="w-full relative p-4">
              <div className="mb-2">Fields</div>
              {columns &&
                columns.map((c) => (
                  <ColumnListItem
                    key={c.name}
                    column={c}
                    selectedColumn={column}
                    setColumn={setColumn}
                  />
                ))}
            </div>
          </div>
          <div className="flex-1 p-4">
            {isUpdating && <LoadingOverlay />}
            {column && (
              <ColumnEditor column={column} setColumnOption={setColumnOption} />
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
  const { data, error, isLoading } = useGetColumnsQuery(
    {
      dataSourceId,
      tableName,
    },
    { skip: !dataSourceId || !tableName }
  );

  return (
    <Layout>
      {isLoading && <LoadingOverlay transparent={true} />}
      {error && <div>Error: {JSON.stringify(error)}</div>}
      {data?.ok && <FieldsEditor columns={data?.data} />}
    </Layout>
  );
}

export default TablesEdit;

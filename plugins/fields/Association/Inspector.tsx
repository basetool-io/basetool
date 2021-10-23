import { Code, FormControl, FormLabel, Input, Select } from "@chakra-ui/react";
import { Column } from "@/features/fields/types";
import { isUndefined } from "lodash";
import { useDataSourceContext } from "@/hooks";
import { useBoolean } from "react-use";
import { useGetColumnsQuery } from "@/features/tables/api-slice";
import OptionWrapper from "@/features/tables/components/OptionsWrapper";
import React, { useEffect, useMemo } from "react";
import fieldOptions from "./fieldOptions";

function Inspector({
  column,
  setColumnOptions,
}: {
  column: Column;
  setColumnOptions: (c: Column, options: Record<string, unknown>) => void;
}) {
  const initialValue = useMemo(
    () => (column.fieldOptions.nameColumn as string) || fieldOptions.nameColumn,
    [column.fieldOptions.nameColumn, fieldOptions.nameColumn]
  );
  const [editRaw, toggleEditRaw] = useBoolean(false);

  // fetch the column for that foreign table ahed of time to better show the user what fields he can choose
  const { dataSourceId } = useDataSourceContext();
  const tableName = column.foreignKeyInfo.foreignTableName;
  const {
    data: columnsResponse,
    error,
    isLoading,
  } = useGetColumnsQuery(
    {
      dataSourceId,
      tableName,
    },
    { skip: !dataSourceId || !tableName }
  );

  // when changing the field type to this one, the new options are not automatically passed to the column
  useEffect(() => {
    setColumnOptions(column, { "fieldOptions.nameColumn": initialValue });
  }, []);

  useEffect(() => {
    toggleEditRaw(!isUndefined(error));
  }, [error]);

  return (
    <OptionWrapper helpText="Make it easier to your users to identify the record you are referencing with this foreign key.">
      <FormControl id="nameColumn">
        <FormLabel>
          <Code>name</Code> column for this association
        </FormLabel>

        {!editRaw && !error && !isLoading && columnsResponse?.ok && (
          <Select
            className="font-mono"
            value={initialValue}
            onChange={(e) => {
              setColumnOptions(column, {
                "fieldOptions.nameColumn": e.currentTarget.value,
              });
            }}
          >
            {columnsResponse.data &&
              columnsResponse.data.map((column: Column) => (
                <option value={column.name}>{column.name}</option>
              ))}
          </Select>
        )}

        {editRaw && (
          <Input
            className="font-mono"
            type="text"
            name="nameColumn"
            placeholder="Name column"
            required={false}
            value={initialValue}
            onChange={(e) => {
              setColumnOptions(column, {
                "fieldOptions.nameColumn": e.currentTarget.value,
              });
            }}
          />
        )}

        <a
          className="text-xs cursor-pointer text-blue-600"
          onClick={toggleEditRaw}
        >
          Edit raw value
        </a>
      </FormControl>
    </OptionWrapper>
  );
}

export default Inspector;

import { AssociationFieldOptions } from "./types"
import { Code, FormControl, FormLabel, Input, Select } from "@chakra-ui/react";
import { Column } from "@/features/fields/types";
import { ListTable } from "@/plugins/data-sources/postgresql/types"
import { first, isUndefined } from "lodash"
import { useBoolean } from "react-use"
import { useGetColumnsQuery, useGetTablesQuery } from "@/features/tables/api-slice"
import { useRouter } from "next/router"
import OptionWrapper from "@/features/tables/components/OptionsWrapper";
import React, { useEffect, useMemo, useState } from "react";
import fieldOptions from "./fieldOptions";

function Inspector({
  column,
  setColumnOption,
}: {
  column: Column<Record<string, unknown>, AssociationFieldOptions>;
  setColumnOption: (c: Column, name: string, value: any) => void;
}) {
  const router = useRouter()
  const initialValue = useMemo(
    () => (column.fieldOptions.nameColumn as string) || fieldOptions.nameColumn,
    [column.fieldOptions.nameColumn, fieldOptions.nameColumn]
  );
  const [editRaw, toggleEditRaw] = useBoolean(false)

  // fetch the column for that foreign table ahed of time to better show the user what fields he can choose
  const dataSourceId = router.query.dataSourceId as string

  const { data: tablesResponse, isLoading: tablesLoading } = useGetTablesQuery(
    { dataSourceId },
    { skip: !dataSourceId }
  );
  const [tableName, setTableName] = useState(column?.foreignKeyInfo?.foreignTableName)
  const {
    data: columnsResponse,
    error,
    isLoading,
    isFetching
  } = useGetColumnsQuery(
    {
      dataSourceId,
      tableName,
    },
    { skip: !dataSourceId || !tableName }
  );

  // when changing the field type to this one, the new options are not automatically passed to the column
  useEffect(() => {
    setColumnOption(column, "fieldOptions.tableName", first(tablesResponse?.data));
    setColumnOption(column, "fieldOptions.nameColumn", initialValue);
  }, []);

  useEffect(() => {
    toggleEditRaw(!isUndefined(error))
  }, [error]);

  // @todo: better UI
  // The user must choose how to join the table first
  // Then he should choose how to show the data.

  return (
    <OptionWrapper helpText="Make it easier for your users to identify the record you are referencing with this association.">
      <pre>{JSON.stringify([column.fieldOptions, error, dataSourceId, tableName], null, 2)}</pre>
      <FormControl id="tableName">
        <FormLabel>
          The table for this association
        </FormLabel>

        {!tablesLoading && tablesResponse?.ok && (<Select
          className="font-mono"
          value={tableName}
          onChange={(e) => {
            setColumnOption(
              column,
              "fieldOptions.tableName",
              e.currentTarget.value
            );
            setTableName(e.currentTarget.value)
          }}
        >
          {tablesResponse?.data && tablesResponse?.data.filter((table: ListTable) => table.schemaname ? table.schemaname === "public" : true).map((table: ListTable) => <option value={table.name}>{table.name}</option>)}
        </Select>)}
      </FormControl>

      <FormControl id="nameColumn">
        <FormLabel>
          <Code>name</Code> column for this association
          <pre>{JSON.stringify(error, isLoading, columnsResponse, null, 2)}</pre>
        </FormLabel>
        {isLoading || isFetching && "Fetching Columns"}
        {!editRaw && !error && !(isLoading || isFetching) && columnsResponse?.ok && (<Select
          className="font-mono"
          value={initialValue}
          onChange={(e) => {
            setColumnOption(
              column,
              "fieldOptions.nameColumn",
              e.currentTarget.value
            );
          }}
        >
          {columnsResponse.data && columnsResponse.data.map((column: Column) => <option value={column.name}>{column.name}</option>)}
        </Select>)}

        {editRaw && <Input
          className="font-mono"
          type="text"
          name="nameColumn"
          placeholder="Name column"
          required={false}
          value={initialValue}
          onChange={(e) => {
            setColumnOption(
              column,
              "fieldOptions.nameColumn",
              e.currentTarget.value
            );
          }}
        />}

        <a className="text-xs cursor-pointer text-blue-600" onClick={toggleEditRaw}>Edit raw value</a>
      </FormControl>
    </OptionWrapper>
  );
}

export default Inspector;

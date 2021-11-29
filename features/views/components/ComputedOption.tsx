import {
  FormControl,
  FormHelperText,
  FormLabel,
  Select,
} from "@chakra-ui/react";
import { get } from "lodash";
import { useColumnsResponse, useTablesResponse } from "@/features/tables/hooks";
import { useDataSourceContext } from "@/hooks";
import { useDataSourcesResponse } from "@/features/data-sources/hooks";
import { useUpdateColumn } from "../hooks";
import OptionWrapper from "@/features/views/components/OptionWrapper";
import React, { memo, useEffect, useMemo, useState } from "react";
import Shimmer from "@/components/Shimmer";

const ComputedOption = () => {
  const { dataSourceId: currentDataSourceId, viewId } = useDataSourceContext();
  const { columns, isFetching: columnsAreFetching } = useColumnsResponse(
    {
      dataSourceId: currentDataSourceId,
      viewId,
    },
    { skip: !currentDataSourceId || !viewId }
  );

  const { column, setColumnOptions } = useUpdateColumn();
  const id = "computed_value";
  const label = "Computed value";
  const helpText =
    "Value that has to be computed. You have to refresh the page after changing this value.";
  // const optionKey = "baseOptions.computedSource";
  // const placeholder = "Label value";
  // const defaultValue = column?.baseOptions?.computedSource;

  const [fieldName, setFieldName] = useState<string>();
  const [dataSourceId, setDataSourceId] = useState<string>();
  const [tableName, setTableName] = useState<string>();
  const [foreignFieldName, setForeignFieldName] = useState<string>();

  const { dataSources, isFetching: dataSourcesAreFetching } =
    useDataSourcesResponse();
  const { tables, isFetching: tablesAreFetching } =
    useTablesResponse(dataSourceId);
  const {
    columns: foreignTableColumns,
    isFetching: foreignTableColumnsAreFetching,
  } = useColumnsResponse(
    {
      dataSourceId,
      tableName,
    },
    { skip: !dataSourceId || !tableName }
  );

  const filteredDataSources = useMemo(
    () => dataSources.filter(({ id }) => id.toString() !== currentDataSourceId),
    [dataSources]
  );

  const foreignDataSourceName = useMemo(
    () =>
      get(
        dataSources.find(({ id }) => id.toString() !== dataSourceId),
        "name"
      ),
    [dataSources, dataSourceId]
  );

  useEffect(() => {
    console.log("setColumnOptions", column);
    if (column) {
      setColumnOptions(column.name, {
        "fieldOptions.localFieldName": fieldName,
        "fieldOptions.foreignDataSourceId": dataSourceId,
        "fieldOptions.foreignTableName": tableName,
        "fieldOptions.foreignFieldName": foreignFieldName,
      });
    }
  }, [fieldName, dataSourceId, tableName, foreignFieldName]);

  if (!column) return null;

  return (
    <OptionWrapper helpText={helpText} id={id} label={label}>
      <div>
        <FormControl id="fieldName">
          <FormLabel>Select field to reference from</FormLabel>
          {columnsAreFetching && <Shimmer width="100%" height={25} />}
          {columnsAreFetching || (
            <Select
              placeholder={
                columns.length === 0
                  ? "Select a table first"
                  : "Select a field to reference"
              }
              onChange={(e) => setFieldName(e.currentTarget.value)}
              size="sm"
            >
              {columns.map((column, idx: number) => (
                <option key={idx} value={column.name}>
                  {column.name}
                </option>
              ))}
            </Select>
          )}
          <FormHelperText>The field you're linking with.</FormHelperText>
        </FormControl>
        <FormControl id="dataSourceId">
          <FormLabel>Select data source</FormLabel>
          {dataSourcesAreFetching && <Shimmer width="100%" height={25} />}
          {dataSourcesAreFetching || (
            <Select
              placeholder="Select a data source"
              onChange={(e) => setDataSourceId(e.currentTarget.value)}
              size="sm"
            >
              {filteredDataSources.map((dataSource, idx: number) => (
                <option key={idx} value={dataSource.id}>
                  {dataSource.name}
                </option>
              ))}
            </Select>
          )}
          <FormHelperText>
            The data source where to pull data from.
          </FormHelperText>
        </FormControl>
        <FormControl id="tableName">
          <FormLabel>Select table</FormLabel>
          {tablesAreFetching && <Shimmer width="100%" height={25} />}
          {tablesAreFetching || (
            <Select
              placeholder={
                tables.length === 0
                  ? "Select a data source first"
                  : "Select a table"
              }
              onChange={(e) => setTableName(e.currentTarget.value)}
              size="sm"
            >
              {tables.map((table, idx: number) => (
                <option key={idx} value={table.name}>
                  {table.name}
                </option>
              ))}
            </Select>
          )}
          <FormHelperText>The table you're linking to.</FormHelperText>
        </FormControl>
        <FormControl id="fieldName">
          <FormLabel>Select field to reference</FormLabel>
          {foreignTableColumnsAreFetching && (
            <Shimmer width="100%" height={25} />
          )}
          {foreignTableColumnsAreFetching || (
            <Select
              placeholder={
                foreignTableColumns.length === 0
                  ? "Select a table first"
                  : "Select a field to reference"
              }
              onChange={(e) => setForeignFieldName(e.currentTarget.value)}
              size="sm"
            >
              {foreignTableColumns.map((column, idx: number) => (
                <option key={idx} value={column.name}>
                  {column.name}
                </option>
              ))}
            </Select>
          )}
          <FormHelperText>The field you're linking with.</FormHelperText>
        </FormControl>
        <div className="bg-gray-100 -mx-2 px-2">
          You're linking this table's <strong>{fieldName}</strong> from the
          current view to <strong>{foreignDataSourceName}'s</strong>{" "}
          <strong>{tableName}</strong> table and{" "}
          <strong>{foreignFieldName}</strong> field.
        </div>
        <pre>{JSON.stringify(foreignDataSourceName, null, 2)}</pre>
        yo
        {dataSourceId}
        {tableName}
        {fieldName}
        {foreignFieldName}
      </div>
    </OptionWrapper>
  );
};

export default memo(ComputedOption);

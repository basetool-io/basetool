import { InspectorProps } from "@/features/fields/types";
import { merge } from "lodash";
import { useColumnsResponse } from "@/features/fields/hooks";
import { useDataSourceContext } from "@/hooks";
import { useTablesResponse } from "@/features/tables/hooks";
import GenericSelectOption from "@/features/views/components/GenericSelectOption";
import React from "react";
import fieldOptions from "./fieldOptions";

function Inspector({ column }: InspectorProps) {
  const options = merge(fieldOptions, column.fieldOptions);
  const { dataSourceId } = useDataSourceContext();
  const { tables, isFetching: tablesAreFetching } = useTablesResponse({
    dataSourceId,
  });
  const { columns, isFetching: columnsAreFetching } = useColumnsResponse({
    dataSourceId,
    tableName: options.tableName,
  });

  return (
    <>
      <GenericSelectOption
        label="Table"
        optionKey="fieldOptions.tableName"
        defaultValue={options.tableName}
        className="font-mono"
        formHelperText="From which table should we extract the data."
        options={tables.map(({ name }) => ({ id: name, label: name }))}
        isLoading={tablesAreFetching}
      />
      <GenericSelectOption
        label="Foreign key"
        optionKey="fieldOptions.columnName"
        defaultValue={options.columnName}
        className="font-mono"
        formHelperText={`What column from ${options.tableName} should be matched with the record id.`}
        options={columns.map(({ name }) => ({ id: name, label: name }))}
        isLoading={columnsAreFetching}
      />
    </>
  );
}

export default Inspector;

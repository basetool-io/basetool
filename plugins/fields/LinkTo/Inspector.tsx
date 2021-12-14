import { InspectorProps } from "@/features/fields/types";
import { merge } from "lodash";
import { useColumnsResponse } from "@/features/fields/hooks";
import { useDataSourceContext } from "@/hooks";
import { useTablesResponse } from "@/features/tables/hooks";
import GenericBooleanOption from "@/features/views/components/GenericBooleanOption";
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
      <GenericBooleanOption
        label="Has many through"
        // helpText={
        //   <>
        //     Some fields you don't want to show at all. By disconnecting the
        //     field it will be hidden from all views and{" "}
        //     <strong>all responses</strong>.
        //   </>
        // }
        optionKey="fieldOptions.hasManyThrough"
        checkboxLabel="Has many through"
        isChecked={options.hasManyThrough === true}
      />

      {/* <GenericTextOption
        label="Table"
        optionKey="options.tableName"
        defaultValue={options.tableName}
        className="font-mono"
        formHelperText="From which table should we extract the data."
      />
      <GenericTextOption
        label="Foreign key"
        optionKey="options.columnName"
        defaultValue={options.columnName}
        className="font-mono"
        formHelperText={`What column from ${options.tableName} should be matched with the record id.`}
      /> */}

      {options.hasManyThrough && "more"}
    </>
  );
}

export default Inspector;

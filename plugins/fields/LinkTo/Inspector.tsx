import { InspectorProps } from "@/features/fields/types";
import { merge } from "lodash";
import GenericTextOption from "@/features/views/components/GenericTextOption";
import React from "react";
import fieldOptions from "./fieldOptions";

function Inspector({ column }: InspectorProps) {
  const options = merge(fieldOptions, column.fieldOptions);

  return (
    <>
      <GenericTextOption
        label="Table"
        optionKey="fieldOptions.tableName"
        defaultValue={options.tableName}
        className="font-mono"
        formHelperText="From which table should we extract the data."
      />
      <GenericTextOption
        label="Foreign key"
        optionKey="fieldOptions.columnName"
        defaultValue={options.columnName}
        className="font-mono"
        formHelperText={`What column from ${options.tableName} should be matched with the record id.`}
      />
    </>
  );
}

export default Inspector;

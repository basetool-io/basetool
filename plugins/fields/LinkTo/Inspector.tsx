import { InspectorProps } from "@/features/fields/types";
import { merge } from "lodash";
import GenericTextOption from "@/features/views/components/GenericTextOption";
import React from "react";
import fieldOptions from "./fieldOptions";

function Inspector({ column, setColumnOptions }: InspectorProps) {
  const options = merge(fieldOptions, column.fieldOptions);

  return (
    <>
      <GenericTextOption
        label="Table"
        helpText="Value that has to be computed."
        optionKey="fieldOptions.tableName"
        placeholder="Labelee value"
        defaultValue={options.tableName}
        className="font-mono"
        // formHelperText={
        //   <>
        //     The table
        //   </>
        // }
      />
      <GenericTextOption
        label="Column"
        helpText="Value that has to be computed."
        optionKey="fieldOptions.columnName"
        placeholder="Labelee value"
        defaultValue={options.tableName}
        className="font-mono"
        // formHelperText={
        //   <>
        //     The table
        //   </>
        // }
      />
    </>
  );
}

export default Inspector;

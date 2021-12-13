import { Code, Input } from "@chakra-ui/react";
import { InspectorProps } from "@/features/fields/types";
import { debounce, merge } from "lodash";
import OptionWrapper from "@/features/views/components/OptionWrapper";
import React, { useCallback } from "react";
import fieldOptions from "./fieldOptions";
import GenericTextOption from "@/features/views/components/GenericTextOption";

function Inspector({ column, setColumnOptions }: InspectorProps) {
  const options = merge(fieldOptions, column.fieldOptions);

  // fetch the column for that foreign table ahed of time to better show the user what fields he can choose
  // const { dataSourceId } = useDataSourceContext();
  // const tableName = column.foreignKeyInfo.foreignTableName;
  // const {
  //   data: columnsResponse,
  //   error,
  //   isLoading,
  // } = useGetColumnsQuery(
  //   {
  //     dataSourceId,
  //     tableName,
  //   },
  //   { skip: !dataSourceId || !tableName }
  // );

  const debouncedSetColumnOptions = useCallback(
    debounce(setColumnOptions, 1000),
    []
  );

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

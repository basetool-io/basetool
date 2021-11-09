import { Code, Select } from "@chakra-ui/react";
import { Column, InspectorProps } from "@/features/fields/types";
import { merge } from "lodash";
import { useDataSourceContext } from "@/hooks";
import { useGetColumnsQuery } from "@/features/fields/api-slice";
import OptionWrapper from "@/features/views/components/OptionWrapper";
import React from "react";
import fieldOptions from "./fieldOptions";

function Inspector({ column, setColumnOptions }: InspectorProps) {
  const options = merge(fieldOptions, column.fieldOptions);

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

  return (
    <OptionWrapper
      helpText="Make it easier to your users to identify the record you are referencing with this foreign key."
      label={
        <>
          The <Code>name</Code> column for this association
        </>
      }
    >
      {!error && !isLoading && columnsResponse?.ok && (
        <Select
          className="font-mono"
          size="sm"
          defaultValue={options.nameColumn}
          onChange={(e) => {
            setColumnOptions(column.name, {
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
    </OptionWrapper>
  );
}

export default Inspector;

import { Code, FormControl, FormLabel, Input } from "@chakra-ui/react";
import { Column } from "@/features/fields/types";
import OptionWrapper from "@/features/tables/components/OptionsWrapper";
import React, { useEffect } from "react";
import fieldOptions from "./fieldOptions";

function Inspector({
  column,
  setColumnOption,
}: {
  column: Column;
  setColumnOption: (c: Column, name: string, value: any) => void;
}) {
  const initialValue =
    column.fieldOptions.nameColumn || fieldOptions.nameColumn;

  // when changing the field type to this one, the new options are not automatically passed to the column
  useEffect(() => {
    setColumnOption(column, "fieldOptions.nameColumn", initialValue);
  }, []);

  return (
    <OptionWrapper helpText="Make it easier to your users to identify the record you are referencing with this foreign key.">
      <FormControl id="nameColumn">
        <FormLabel>
          Foregin key <Code>name</Code> column
        </FormLabel>
        <Input
          className="font-mono"
          type="text"
          name="nameColumn"
          placeholder="Name column"
          required={false}
          defaultValue={initialValue as number}
          onChange={(e) => {
            setColumnOption(
              column,
              "fieldOptions.nameColumn",
              e.currentTarget.value
            );
          }}
        />
      </FormControl>
    </OptionWrapper>
  );
}

export default Inspector;

import { Column } from "@/features/fields/types";
import {
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import OptionWrapper from "@/features/tables/components/OptionsWrapper";
import React, { useEffect } from "react";
import fieldOptions from "./fieldOptions";

function Inspector({
  column,
  setColumnOptions,
}: {
  column: Column;
  setColumnOptions: (c: Column, options: Record<string, unknown>) => void;
}) {
  const defaultOptions = fieldOptions.options ? fieldOptions.options : "";
  const initialOptions = column.fieldOptions.options
    ? column.fieldOptions.options
    : defaultOptions;

  // when changing the field type to this one, the new options are not automatically passed to the column
  useEffect(() => {
    setColumnOptions(column, { "fieldOptions.options": initialOptions });
  }, []);

  return (
    <OptionWrapper helpText="What are the options a user can choose from?">
      <FormControl id="options">
        <FormLabel>Options</FormLabel>
        <Input
          type="text"
          name="options"
          placeholder="Options"
          required={false}
          defaultValue={initialOptions as string}
          onChange={(e) => {
            setColumnOptions(column, {
              "fieldOptions.options": e.currentTarget.value,
            });
          }}
        />
        <FormHelperText>Add the values comma separated.</FormHelperText>
      </FormControl>
    </OptionWrapper>
  );
}

export default Inspector;

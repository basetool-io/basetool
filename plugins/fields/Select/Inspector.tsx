import { FormHelperText, Input } from "@chakra-ui/react";
import { InspectorProps } from "@/features/fields/types";
import { debounce, merge } from "lodash";
import OptionWrapper from "@/features/views/components/OptionWrapper";
import React, { useCallback } from "react";
import fieldOptions from "./fieldOptions";

function Inspector({
  column,
  setColumnOptions,
}: InspectorProps) {
  const options = merge(fieldOptions, column.fieldOptions);

  const debouncedSetColumnOptions = useCallback(
    debounce(setColumnOptions, 1000),
    []
  );

  const handleOnChange = (event: any) => {
    if (column)
      debouncedSetColumnOptions(column.name, {
        "fieldOptions.options": event.currentTarget.value,
      });
  };

  return (
    <OptionWrapper
      helpText="What are the options a user can choose from?"
      label="Options"
    >
      <Input
        type="text"
        name="options"
        placeholder="Options"
        required={false}
        size="sm"
        defaultValue={options.options}
        onChange={handleOnChange}
      />
      <FormHelperText>Add the values comma separated.</FormHelperText>
    </OptionWrapper>
  );
}

export default Inspector;

import { Input } from "@chakra-ui/react";
import { InspectorProps } from "@/features/fields/types";
import { debounce, merge } from "lodash";
import OptionWrapper from "@/features/views/components/OptionWrapper";
import React, { useCallback } from "react";
import fieldOptions from "./fieldOptions";

function Inspector({ column, setColumnOptions }: InspectorProps) {
  const options = merge(fieldOptions, column.fieldOptions);
  const debouncedSetColumnOptions = useCallback(
    debounce(setColumnOptions, 1000),
    []
  );

  const handleOnChange = (event: any) => {
    if (column)
      debouncedSetColumnOptions(column.name, {
        "fieldOptions.rows": event.currentTarget.value,
      });
  };

  return (
    <OptionWrapper helpText="Choose how tall should the input be." label="Rows">
      <Input
        type="number"
        name="rows"
        placeholder="Rows"
        required={false}
        defaultValue={options.rows as number}
        onChange={handleOnChange}
      />
    </OptionWrapper>
  );
}

export default Inspector;

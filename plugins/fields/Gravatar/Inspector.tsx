import { Column } from "@/features/fields/types";
import { FormControl, FormLabel, Input } from "@chakra-ui/react";
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
  const defaultDimensions = fieldOptions.showDimensions;
  const initialDimensions = column.fieldOptions.showDimensions
    ? column.fieldOptions.showDimensions
    : defaultDimensions;

  // when changing the field type to this one, the new options are not automatically passed to the column
  useEffect(() => {
    setColumnOptions(column, {
      "fieldOptions.showDimensions": initialDimensions,
    });
  }, []);

  return (
    <OptionWrapper helpText="Choose how big should the gravatar be.">
      <FormControl id="dimensions">
        <FormLabel>Show page dimensions</FormLabel>
        <Input
          type="number"
          name="dimensions"
          placeholder="dimensions"
          required={false}
          defaultWidthValue={initialDimensions as number}
          onChange={(e) => {
            setColumnOptions(column, {
              "fieldOptions.showDimensions":
                parseInt(e.currentTarget.value) > 0
                  ? parseInt(e.currentTarget.value)
                  : initialDimensions,
            });
          }}
        />
      </FormControl>
    </OptionWrapper>
  );
}

export default Inspector;

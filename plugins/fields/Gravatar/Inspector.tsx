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
  const initialDimensions = column.fieldOptions.showDimensions
    ? column.fieldOptions.showDimensions
    : fieldOptions.showDimensions;

  // when changing the field type to this one, the new options are not automatically passed to the column
  useEffect(() => {
    setColumnOptions(column, {
      "fieldOptions.showDimensions": initialDimensions,
    });
  }, []);

  return (
    <>
      <OptionWrapper helpText="Choose how big should the gravatar be on show view.">
        <FormControl id="dimensions">
          <FormLabel>Show Dimensions</FormLabel>
          <Input
            type="number"
            name="dimensions"
            required={false}
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
      <OptionWrapper helpText="Choose how big should the gravatar be on index view.">
        <FormControl id="dimensions">
          <FormLabel>Index Dimensions</FormLabel>
          <Input
            type="number"
            name="dimensions"
            placeholder={`current value: ${column.fieldOptions.indexDimensions}`}
            required={false}
            onChange={(e) => {
              setColumnOptions(column, {
                "fieldOptions.indexDimensions":
                  parseInt(e.currentTarget.value) > 0
                    ? parseInt(e.currentTarget.value)
                    : initialDimensions,
              });
            }}
          />
        </FormControl>
      </OptionWrapper>
    </>
  );
}

export default Inspector;

import { Checkbox, FormControl, FormLabel, Input } from "@chakra-ui/react";
import { Column } from "@/features/fields/types";
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
  const initialShowDimensions = column.fieldOptions.showDimensions
    ? column.fieldOptions.showDimensions
    : fieldOptions.showDimensions;

  const initialIndexDimensions = column.fieldOptions.indexDimensions
    ? column.fieldOptions.indexDimensions
    : fieldOptions.indexDimensions;

  // when changing the field type to this one, the new options are not automatically passed to the column
  useEffect(() => {
    setColumnOptions(column, {
      "fieldOptions.showDimensions": initialShowDimensions,
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
            value={column.fieldOptions.showDimensions as number}
            placeholder="Show Dimensions"
            required={false}
            onChange={(e) => {
              setColumnOptions(column, {
                "fieldOptions.showDimensions":
                  parseInt(e.currentTarget.value) > 0
                    ? parseInt(e.currentTarget.value)
                    : initialShowDimensions,
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
            value={column.fieldOptions.indexDimensions as number}
            placeholder="Index Dimensions"
            required={false}
            onChange={(e) => {
              setColumnOptions(column, {
                "fieldOptions.indexDimensions":
                  parseInt(e.currentTarget.value) > 0
                    ? parseInt(e.currentTarget.value)
                    : initialIndexDimensions,
              });
            }}
          />
        </FormControl>
      </OptionWrapper>
      <OptionWrapper helpText="Rounded gravatar">
        <FormControl id="openNewTab" className="mt-2">
          <FormLabel>Rounded Gravatar</FormLabel>
          <Checkbox
            isChecked={column.fieldOptions.rounded as boolean}
            onChange={() =>
              setColumnOptions(column, {
                "fieldOptions.rounded": !column.fieldOptions.rounded,
              })
            }
          >
            Rounded Gravatar
          </Checkbox>
        </FormControl>
      </OptionWrapper>
    </>
  );
}

export default Inspector;

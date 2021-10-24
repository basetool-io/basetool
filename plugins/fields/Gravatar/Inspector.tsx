import { Checkbox, FormControl, FormLabel, Input } from "@chakra-ui/react";
import { Column } from "@/features/fields/types";
import { merge } from "lodash";
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
  const options = merge(fieldOptions, column.fieldOptions);

  // when changing the field type to this one, the new options are not automatically passed to the column
  useEffect(() => {
    setColumnOptions(column, {
      "fieldOptions.indexDimensions": options.indexDimensions,
      "fieldOptions.showDimensions": options.showDimensions,
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
            value={options.showDimensions as number}
            placeholder="Show Dimensions"
            required={false}
            onChange={(e) => {
              setColumnOptions(column, {
                "fieldOptions.showDimensions":
                  parseInt(e.currentTarget.value) > 0
                    ? parseInt(e.currentTarget.value)
                    : options.showDimensions,
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
            value={options.indexDimensions as number}
            placeholder="Index Dimensions"
            required={false}
            onChange={(e) => {
              setColumnOptions(column, {
                "fieldOptions.indexDimensions":
                  parseInt(e.currentTarget.value) > 0
                    ? parseInt(e.currentTarget.value)
                    : options.indexDimensions,
              });
            }}
          />
        </FormControl>
      </OptionWrapper>
      <OptionWrapper helpText="Rounded gravatar">
        <FormControl id="openNewTab" className="mt-2">
          <FormLabel>Avatar shape</FormLabel>
          <Checkbox
            isChecked={options.rounded as boolean}
            onChange={() =>
              setColumnOptions(column, {
                "fieldOptions.rounded": !options.rounded,
              })
            }
          >
            Rounded avatar
          </Checkbox>
        </FormControl>
      </OptionWrapper>
    </>
  );
}

export default Inspector;

import { Checkbox, Input } from "@chakra-ui/react";
import { InspectorProps } from "@/features/fields/types";
import { debounce, merge } from "lodash";
import OptionWrapper from "@/features/views/components/OptionWrapper";
import React, { useCallback, useEffect } from "react";
import fieldOptions from "./fieldOptions";

function Inspector({ column, setColumnOptions }: InspectorProps) {
  const options = merge(fieldOptions, column.fieldOptions);

  // when changing the field type to this one, the new options are not automatically passed to the column
  useEffect(() => {
    setColumnOptions(column.name, {
      "fieldOptions.indexDimensions": options.indexDimensions,
      "fieldOptions.showDimensions": options.showDimensions,
    });
  }, []);

  const debouncedSetColumnOptions = useCallback(
    debounce(setColumnOptions, 1000),
    []
  );

  return (
    <>
      <OptionWrapper
        helpText="Choose how big should the gravatar be on Index and show views."
        label="Index &amp; Show Dimensions"
      >
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            name="dimensions"
            defaultValue={options.indexDimensions as number}
            placeholder="Index Dimensions"
            required={false}
            onChange={(e) => {
              debouncedSetColumnOptions(column.name, {
                "fieldOptions.indexDimensions":
                  parseInt(e.currentTarget.value) > 0
                    ? parseInt(e.currentTarget.value)
                    : options.indexDimensions,
              });
            }}
          />
          <Input
            type="number"
            name="dimensions"
            defaultValue={options.showDimensions as number}
            placeholder="Show Dimensions"
            required={false}
            onChange={(e) => {
              debouncedSetColumnOptions(column.name, {
                "fieldOptions.showDimensions":
                  parseInt(e.currentTarget.value) > 0
                    ? parseInt(e.currentTarget.value)
                    : options.showDimensions,
              });
            }}
          />
        </div>
      </OptionWrapper>
      <OptionWrapper helpText="Rounded gravatar" label="Avatar shape">
        <Checkbox
          isChecked={options.rounded as boolean}
          onChange={() =>
            setColumnOptions(column.name, {
              "fieldOptions.rounded": !options.rounded,
            })
          }
        >
          Rounded avatar
        </Checkbox>
      </OptionWrapper>
    </>
  );
}

export default Inspector;

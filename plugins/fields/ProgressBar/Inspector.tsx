import { Checkbox, Input } from "@chakra-ui/react";
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

  return (
    <>
      <OptionWrapper
        helpText="What is the maximum value the progress should have and how much can the user increment by?"
        label="Maximum &amp; step"
      >
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            name="max"
            placeholder="Max"
            required={false}
            defaultValue={options.max}
            onChange={(e) => {
              debouncedSetColumnOptions(column.name, {
                "fieldOptions.max":
                  parseInt(e.currentTarget.value) > 0
                    ? parseInt(e.currentTarget.value)
                    : options.maxValue,
              });
            }}
          />
          <Input
            type="number"
            name="step"
            placeholder="Step"
            required={false}
            defaultValue={fieldOptions.step}
            onChange={(e) => {
              debouncedSetColumnOptions(column.name, {
                "fieldOptions.step":
                  parseInt(e.currentTarget.value) > 0
                    ? parseInt(e.currentTarget.value)
                    : options.stepValue,
              });
            }}
          />
        </div>
      </OptionWrapper>
      <OptionWrapper
        helpText="You might want to add something at the end of the value like '%'"
        label="Value Suffix"
      >
        <Input
          type="text"
          name="valueSuffix"
          placeholder="Value Suffix"
          required={false}
          defaultValue={fieldOptions.valueSuffix}
          onChange={(e) => {
            debouncedSetColumnOptions(column.name, {
              "fieldOptions.valueSuffix": e.currentTarget.value,
            });
          }}
        />
      </OptionWrapper>
      <OptionWrapper helpText="Display value" label="Display Value">
        <Checkbox
          isChecked={fieldOptions.displayValue}
          onChange={() =>
            debouncedSetColumnOptions(column.name, {
              "fieldOptions.displayValue": !fieldOptions.displayValue,
            })
          }
        >
          Display Value
        </Checkbox>
      </OptionWrapper>
    </>
  );
}
export default Inspector;

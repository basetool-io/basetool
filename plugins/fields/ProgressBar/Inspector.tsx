import { Checkbox, FormControl, FormLabel, Input } from "@chakra-ui/react";
import { Column } from "@/features/fields/types";
import { ProgressBarFieldOptions } from "./types";
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
  const fieldOptions = column.fieldOptions as ProgressBarFieldOptions;
  const initialMaxValue = fieldOptions.max
    ? column.fieldOptions.max
    : fieldOptions.max;

  const initialStepValue = fieldOptions.step
    ? column.fieldOptions.step
    : fieldOptions.step;

  const initialValueSuffix = fieldOptions.valueSuffix
    ? column.fieldOptions.valueSuffix
    : fieldOptions.valueSuffix;

  const initialDisplayValue = fieldOptions.displayValue
    ? column.fieldOptions.displayValue
    : fieldOptions.displayValue;

  // when changing the field type to this one, the new options are not automatically passed to the column
  useEffect(() => {
    setColumnOptions(column, {
      "fieldOptions.max": initialMaxValue,
      "fieldOptions.step": initialStepValue,
      "fieldOptions.value_suffix": initialValueSuffix,
      "fieldOptions.display_value": initialDisplayValue,
    });
  }, []);

  return (
    <>
      <OptionWrapper helpText="Choose max value">
        <FormControl id="max">
          <FormLabel>Max</FormLabel>
          <Input
            type="number"
            name="max"
            placeholder="Max"
            required={false}
            value={fieldOptions.max}
            onChange={(e) => {
              setColumnOptions(column, {
                "fieldOptions.max":
                  parseInt(e.currentTarget.value) > 0
                    ? parseInt(e.currentTarget.value)
                    : initialMaxValue,
              });
            }}
          />
        </FormControl>
      </OptionWrapper>
      <OptionWrapper helpText="Choose max value">
        <FormControl id="step">
          <FormLabel>Step</FormLabel>
          <Input
            type="number"
            name="step"
            placeholder="Step"
            required={false}
            value={fieldOptions.step}
            onChange={(e) => {
              setColumnOptions(column, {
                "fieldOptions.step":
                  parseInt(e.currentTarget.value) > 0
                    ? parseInt(e.currentTarget.value)
                    : initialStepValue,
              });
            }}
          />
        </FormControl>
      </OptionWrapper>
      <OptionWrapper helpText="Choose value suffix">
        <FormControl id="valueSuffix" className="mt-2">
          <FormLabel>Value Suffix</FormLabel>
          <Input
            type="text"
            name="valueSuffix"
            placeholder="Value Suffix"
            required={false}
            value={fieldOptions.valueSuffix}
            onChange={(e) => {
              setColumnOptions(column, {
                "fieldOptions.value_suffix": e.currentTarget.value,
              });
            }}
          />
        </FormControl>
      </OptionWrapper>
      <OptionWrapper helpText="Display value">
        <FormControl id="openNewTab" className="mt-2">
          <FormLabel>Display Value</FormLabel>
          <Checkbox
            isChecked={fieldOptions.displayValue}
            onChange={() =>
              setColumnOptions(column, {
                "fieldOptions.displayValue": !fieldOptions.displayValue,
              })
            }
          >
            Display Value
          </Checkbox>
        </FormControl>
      </OptionWrapper>
    </>
  );
}
export default Inspector;
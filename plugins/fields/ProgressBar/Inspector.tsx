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
  const defaultMaxValue = (fieldOptions as ProgressBarFieldOptions).max;
  const initialMaxValue = (column.fieldOptions as ProgressBarFieldOptions).max
    ? column.fieldOptions.max
    : defaultMaxValue;

  const defaultStepValue = fieldOptions.step;
  const initialStepValue = (column.fieldOptions as ProgressBarFieldOptions).step
    ? column.fieldOptions.step
    : defaultStepValue;

  const defaultValueSuffix = fieldOptions.value_suffix;
  const initialValueSuffix = (column.fieldOptions as ProgressBarFieldOptions)
    .value_suffix
    ? column.fieldOptions.value_suffix
    : defaultValueSuffix;

  const defaultDisplayValue = fieldOptions.display_value;
  const initialDisplayValue = (column.fieldOptions as ProgressBarFieldOptions)
    .display_value
    ? column.fieldOptions.display_value
    : defaultDisplayValue;

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
    <OptionWrapper helpText="Progress bar values">
      <FormControl id="max">
        <FormLabel>Max</FormLabel>
        <Input
          type="number"
          name="max"
          placeholder="Max"
          required={false}
          value={column.fieldOptions.max as number}
          defaultMaxValue={initialMaxValue}
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
      <FormControl id="step">
        <FormLabel>Step</FormLabel>
        <Input
          type="number"
          name="step"
          placeholder="Step"
          required={false}
          value={column.fieldOptions.step as number}
          defaultMaxValue={initialStepValue}
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
      <FormControl id="valueSuffix" className="mt-2">
        <FormLabel>Value Suffix</FormLabel>
        <Input
          type="text"
          name="valueSuffix"
          placeholder="Value Suffix"
          required={false}
          value={column.fieldOptions.value_suffix as string}
          onChange={(e) => {
            setColumnOptions(column, {
              "fieldOptions.value_suffix": e.currentTarget.value,
            });
          }}
        />
      </FormControl>
      <FormControl id="openNewTab" className="mt-2">
        <FormLabel>Display Value</FormLabel>
        <Checkbox
          isChecked={column.fieldOptions.display_value === true}
          onChange={() =>
            setColumnOptions(column, {
              "fieldOptions.display_value": !column.fieldOptions.display_value,
            })
          }
        >
          Display Value
        </Checkbox>
      </FormControl>
    </OptionWrapper>
  );
}
export default Inspector;

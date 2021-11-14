import { Checkbox, Code } from "@chakra-ui/react";
import { useSegment } from "@/hooks";
import { useUpdateColumn } from "../hooks";
import { without } from "lodash";
import GenericBooleanOption from "./GenericBooleanOption";
import React from "react";

const NULL_VALUES = [
  {
    value: "",
    label: (
      <>
        <Code>''</Code>{" "}
        <span className="text-gray-500 text-sm">(empty string)</span>
      </>
    ),
  },
  {
    value: "null",
    label: (
      <>
        <Code>null</Code>{" "}
        <span className="text-gray-500 text-sm">(as a string)</span>
      </>
    ),
  },
  {
    value: "0",
    label: (
      <>
        <Code>0</Code>{" "}
        <span className="text-gray-500 text-sm">(the number 0)</span>
      </>
    ),
  },
];

const NullableOption = () => {
  const track = useSegment();

  const { column, setColumnOptions } = useUpdateColumn();

  if (!column) return null;

  const handleOnChange = (e: any, value: string) => {
    // Get the null values
    let newNullValues = Object.values({
      ...column.baseOptions.nullValues,
    });

    // Add or remove the clicked item
    if (e.currentTarget.checked) {
      newNullValues.push(value);
    } else {
      newNullValues = without(newNullValues, value);
    }

    // Set the options
    setColumnOptions(column.name, {
      "baseOptions.nullValues": newNullValues,
    });

    track("Changed the field type selector", {
      type: e.currentTarget.value,
    });
  };

  return (
    <>
      <GenericBooleanOption
        helpText="There are cases where you may prefer to explicitly instruct Basetool to store a NULL value in the database row when the field is empty."
        formHelperText="Has to be nullable in the DB in order to use this option."
        label="Nullable"
        optionKey="baseOptions.nullable"
        checkboxLabel="Nullable"
        isChecked={column.baseOptions.nullable === true}
        isDisabled={column.baseOptions.required === true}
      >
        {column.baseOptions.nullable === true && (
          <div className="pl-6 mt-4 pr-2">
            {NULL_VALUES.map(({ value, label }) => (
              <div key={value}>
                <Checkbox
                  id={`null_value_${label}`}
                  isChecked={Object.values(
                    column.baseOptions.nullValues
                  ).includes(value)}
                  onChange={(e) => handleOnChange(e, value)}
                >
                  {label}
                </Checkbox>
              </div>
            ))}
          </div>
        )}
      </GenericBooleanOption>
    </>
  );
};

export default NullableOption;

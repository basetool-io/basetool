import { FieldType } from "@/features/fields/types";
import { Select } from "@chakra-ui/react";
import { useSegment } from "@/hooks";
import { useUpdateColumn } from "../hooks";
import OptionWrapper from "@/features/views/components/OptionsWrapper";
import React from "react";

export const FieldTypeOption = () => {
  const track = useSegment();

  const { column, columnOptions, setColumnOptions } = useUpdateColumn();

  if (!column) return null;

  return (
    <OptionWrapper
      helpText="We try to infer the type of field from your data source.
      Sometimes we might not get it right the first time. Choose the appropiate type of field
      from these options"
      label="Field type"
      id="fieldType"
    >
      <Select
        value={column.fieldType}
        onClick={() => {
          track("Clicked the field type selector");
        }}
        size="sm"
        onChange={(e) => {
          setColumnOptions(column.name, {
            fieldType: e.currentTarget.value as FieldType,
          });
          track("Changed the field type selector");
        }}
      >
        <option disabled>Select field type</option>
        {columnOptions &&
          columnOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
      </Select>
    </OptionWrapper>
  );
};

export default FieldTypeOption;

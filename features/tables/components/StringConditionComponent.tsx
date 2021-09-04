import { Filter } from "@/features/tables/components/FilterRow";
import ConditionSelect from "./ConditionSelect";
import React from "react";

export enum StringFilterConditions {
  is = "is",
  is_not = "is not",
  contains = "contains",
  not_contains = "does not contain",
  starts_with = "starts with",
  ends_with = "ends with",
  is_empty = "is empty",
  is_not_empty = "is not empty",
}

function StringConditionComponent({
  filter,
  onChange,
}: {
  filter: Filter;
  onChange: (condition: StringFilterConditions) => void;
}) {
  return (
    <ConditionSelect
      value={filter.condition}
      options={Object.entries(StringFilterConditions)}
      onChange={(value: unknown) => onChange(value as StringFilterConditions)}
    />
  );
}

export default StringConditionComponent;

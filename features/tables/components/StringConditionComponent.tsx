import { IFilter } from "@/features/tables/components/Filter";
import ConditionSelect from "./ConditionSelect";
import React from "react";

export enum StringFilterConditions {
  is = "is",
  is_not = "is_not",
  contains = "contains",
  not_contains = "not_contains",
  starts_with = "starts_with",
  ends_with = "ends_with",
  is_empty = "is_empty",
  is_not_empty = "is_not_empty",
  is_null = "is_null",
  is_not_null = "is_not_null",
}

function StringConditionComponent({
  filter,
  onChange,
}: {
  filter: IFilter;
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

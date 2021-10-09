import { IFilter } from "@/features/tables/components/Filter";
import ConditionSelect from "./ConditionSelect";
import React from "react";

export enum SelectFilterConditions {
  is = "is",
  is_not = "is_not",
  contains = "contains",
  not_contains = "not_contains",
  is_empty = "is_empty",
  is_not_empty = "is_not_empty",
  is_null = "is_null",
  is_not_null = "is_not_null",
}

function SelectConditionComponent({
  filter,
  onChange,
}: {
  filter: IFilter;
  onChange: (condition: SelectFilterConditions) => void;
}) {
  return (
    <ConditionSelect
      value={filter.condition}
      options={Object.entries(SelectFilterConditions)}
      onChange={(value: unknown) => onChange(value as SelectFilterConditions)}
    />
  );
}

export default SelectConditionComponent;

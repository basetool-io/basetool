import { IFilter } from "@/features/tables/components/Filter";
import ConditionSelect from "./ConditionSelect";
import React from "react";

export enum BooleanFilterConditions {
  is_true = "is_true",
  is_false = "is_false",
  is_null = "is_null",
  is_not_null = "is_not_null",
}

function IntConditionComponent({
  filter,
  onChange,
}: {
  filter: IFilter;
  onChange: (condition: BooleanFilterConditions) => void;
}) {
  return (
    <ConditionSelect
      value={filter.condition}
      options={Object.entries(BooleanFilterConditions)}
      onChange={(value: unknown) => onChange(value as BooleanFilterConditions)}
    />
  );
}

export default IntConditionComponent;

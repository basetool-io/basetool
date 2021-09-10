import { IFilter } from "@/features/tables/components/Filter";
import ConditionSelect from "./ConditionSelect";
import React from "react";

export enum IntFilterConditions {
  is = "=",
  is_not = "!=",
  gt = ">",
  gte = ">=",
  lt = "<",
  lte = "<=",
  is_empty = "is empty",
  is_not_empty = "is not empty",
}

function IntConditionComponent({
  filter,
  onChange,
}: {
  filter: IFilter;
  onChange: (condition: IntFilterConditions) => void;
}) {
  return (
    <ConditionSelect
      value={filter.condition}
      options={Object.entries(IntFilterConditions)}
      onChange={(value: unknown) => onChange(value as IntFilterConditions)}
    />
  );
}

export default IntConditionComponent;

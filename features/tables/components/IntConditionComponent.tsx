import { IFilter } from "@/features/tables/components/Filter";
import ConditionSelect from "./ConditionSelect";
import React from "react";

export enum IntFilterConditions {
  is = "is",
  is_not = "is_not",
  gt = "gt",
  gte = "gte",
  lt = "lt",
  lte = "lte",
  is_null = "is_null",
  is_not_null = "is_not_null",
}

function IntConditionComponent({
  filter,
  onChange,
}: {
  filter: IFilter;
  onChange: (condition: IntFilterConditions) => void;
}) {
  const options = {
    is: "=",
    is_not: "!=",
    gt: ">",
    gte: ">=",
    lt: "<",
    lte: "<=",
    is_null: "is_null",
    is_not_null: "is_not_null",
  }

return (
    <ConditionSelect
      value={filter.condition}
      options={Object.entries(options)}
      onChange={(value: unknown) => onChange(value as IntFilterConditions)}
    />
  );
}

export default IntConditionComponent;

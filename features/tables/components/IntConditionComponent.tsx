import { IFilter } from "../types";
import { IntFilterConditions } from "..";
import ConditionSelect from "./ConditionSelect";
import React from "react";

const options = {
  is: "=",
  is_not: "!=",
  gt: ">",
  gte: ">=",
  lt: "<",
  lte: "<=",
  is_null: "is_null",
  is_not_null: "is_not_null",
};

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
      options={Object.entries(options)}
      onChange={(value: unknown) => onChange(value as IntFilterConditions)}
    />
  );
}

export default IntConditionComponent;

import { BooleanFilterConditions } from "..";
import { IFilter } from "../types";
import ConditionSelect from "./ConditionSelect";
import React from "react";

function BooleanConditionComponent({
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

export default BooleanConditionComponent;

import { IFilter } from "../types";
import { StringFilterConditions } from "..";
import ConditionSelect from "./ConditionSelect";
import React from "react";

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

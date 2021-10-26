import { IFilter } from "../types";
import { SelectFilterConditions } from "..";
import ConditionSelect from "./ConditionSelect";
import React from "react";

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

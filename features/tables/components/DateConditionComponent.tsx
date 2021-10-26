import { DateFilterConditions } from "..";
import { IFilter } from "../types";
import ConditionSelect from "./ConditionSelect";
import React from "react";

function DateConditionComponent({
  filter,
  onChange,
}: {
  filter: IFilter;
  onChange: (condition: DateFilterConditions) => void;
}) {
  return (
    <ConditionSelect
      value={filter.condition}
      options={Object.entries(DateFilterConditions)}
      onChange={(value: unknown) => onChange(value as DateFilterConditions)}
    />
  );
}

export default DateConditionComponent;

import { IFilter } from "../types";
import { IntFilterConditions } from "..";
import ConditionSelect from "./ConditionSelect";
import React from "react";
import options from "@/plugins/fields/Number/options";

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

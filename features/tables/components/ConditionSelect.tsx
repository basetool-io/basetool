import { Select } from "@chakra-ui/react";
import React, { memo } from "react";

function ConditionSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: [string, string][];
  onChange: (value: unknown) => void;
}) {
  return (
      <Select
        size="xs"
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
      >
        {options.map(([id, label]) => (
          <option key={id} value={id}>
            {label.replaceAll("_", " ")}
          </option>
        ))}
      </Select>
  );
}

export default memo(ConditionSelect);

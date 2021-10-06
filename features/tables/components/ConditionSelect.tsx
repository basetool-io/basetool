import { FormControl, Select } from "@chakra-ui/react";
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
    <FormControl id="condition">
      <Select
        size="sm"
        className="font-mono"
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
      >
        {options.map(([id, label]) => (
          <option key={id} value={id}>
            {label.replaceAll("_", " ")}
          </option>
        ))}
      </Select>
    </FormControl>
  );
}

export default memo(ConditionSelect);

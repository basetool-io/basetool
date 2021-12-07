import { FilterVerbs } from "..";
import { FormControl, Select } from "@chakra-ui/react";
import React, { memo, useMemo } from "react";

function VerbComponent({
  idx,
  verb,
  onChange,
}: {
  idx: number;
  verb: FilterVerbs;
  onChange: (verb: FilterVerbs) => void;
}) {
  const isFirst = useMemo(() => idx === 0, [idx]);
  const isSecond = useMemo(() => idx === 1, [idx]);
  const isMoreThanSecond = useMemo(() => idx > 1, [idx]);

  return (
    <>
      <div className="text-gray-800 text-sm">
        {isFirst && "where"}
        {isMoreThanSecond && verb}
      </div>
      {isSecond && (
        <FormControl>
          <Select
            size="xs"
            value={verb}
            onChange={(e) => onChange(e.currentTarget.value as FilterVerbs)}
          >
            {Object.entries(FilterVerbs).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </Select>
        </FormControl>
      )}
    </>
  );
}

export default memo(VerbComponent);

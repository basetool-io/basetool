import { FormControl, Select } from "@chakra-ui/react";
import React, { memo } from "react";
import classNames from "classnames";

export type FilterVerb = FilterVerbs;

export enum FilterVerbs {
  and = "and",
  or = "or",
}

function VerbComponent({
  idx,
  verb,
  onChange,
  isFilterGroup = false,
}: {
  idx: number;
  verb: FilterVerb;
  onChange: (verb: FilterVerb) => void;
  isFilterGroup?: boolean;
}) {
  return (
    <FormControl
      id="verb"
      className={classNames(
        "min-w-[65px] max-w-[65px]",
        { " pt-2 mr-1": isFilterGroup && idx === 1 },
        { " pt-3 mr-1": isFilterGroup && idx !== 1 }
      )}
    >
      {idx === 0 && (
        <div className="text-gray-800 text-right text-sm font-mono">where</div>
      )}
      {idx > 1 && (
        <div className="text-gray-800 text-right text-sm font-mono">{verb}</div>
      )}

      {idx === 1 && (
        <Select
          size="xs"
          className="font-mono"
          value={verb}
          onChange={(e) => onChange(e.currentTarget.value as FilterVerb)}
        >
          {Object.entries(FilterVerbs).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </Select>
      )}
    </FormControl>
  );
}

export default memo(VerbComponent);

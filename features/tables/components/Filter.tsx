import { Button, FormControl, Input, Select, Tooltip } from "@chakra-ui/react";
import { Column } from "@/features/fields/types";
import { IntFilterConditions } from "@/features/tables/components/IntConditionComponent";
import { StringFilterConditions } from "@/features/tables/components/StringConditionComponent";
import { XIcon } from "@heroicons/react/outline";
import { useFilters } from "@/hooks";
import ConditionComponent from "@/features/tables/components/ConditionComponent";
import React, { memo, useMemo } from "react";

export type FilterConditions = IntFilterConditions | StringFilterConditions;
export type FilterVerbs = "where" | "and" | "or";

export type IFilter = {
  column: Column;
  columnName: string;
  columnLabel: string;
  condition: FilterConditions;
  value: string;
};

const Filter = ({
  columns,
  filter,
  idx,
}: {
  columns: Column[];
  filter: IFilter;
  idx: number;
}) => {
  const { removeFilter, updateFilter } = useFilters();
  const verb = useMemo(() => (idx === 0 ? "where" : "and"), [idx]);

  const changeFilterColumn = (columnName: string) => {
    const column = columns.find((c) => c.name === columnName) as Column;
    updateFilter(idx, {
      ...filter,
      column,
      columnName,
    });
  };

  const changeFilterCondition = (condition: FilterConditions) => {
    updateFilter(idx, {
      ...filter,
      condition,
    });
  };

  const changeFilterValue = (value: string) => {
    updateFilter(idx, {
      ...filter,
      value,
    });
  };

  return (
    <>
      <div className="flex w-full items-center space-x-4">
        <Tooltip label="Remove fitler">
          <Button size="xs" variant="link" onClick={() => removeFilter(idx)}>
            <XIcon className="h-4" />
          </Button>
        </Tooltip>
        <div className="min-w-[50px]">{verb}</div>
        <FormControl id="columns">
          <Select
            size="sm"
            className="font-mono"
            value={filter.columnName}
            onChange={(e) => changeFilterColumn(e.currentTarget.value)}
          >
            {columns &&
              columns.map((column, idx) => (
                <option key={idx} value={column.name}>
                  {column.label}
                </option>
              ))}
          </Select>
        </FormControl>
        <ConditionComponent
          filter={filter}
          onChange={(value: FilterConditions) => changeFilterCondition(value)}
        />
        <FormControl id="value">
          <Input
            size="sm"
            value={filter.value}
            className="font-mono"
            onChange={(e) => changeFilterValue(e.currentTarget.value)}
          />
        </FormControl>
      </div>
    </>
  );
};

export default memo(Filter);

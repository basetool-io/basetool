import { Button, FormControl, Input, Select } from "@chakra-ui/react";
import { Column } from "@/features/fields/types";
import { IntFilterConditions } from "@/features/tables/components/IntConditionComponent"
import { StringFilterConditions } from "@/features/tables/components/StringConditionComponent"
import { XIcon } from "@heroicons/react/outline";
import { useFilters } from "@/hooks";
import { useRouter } from "next/router"
import ConditionComponent from "@/features/tables/components/ConditionComponent"
import React, { useMemo } from "react";

export type FilterConditions = IntFilterConditions | StringFilterConditions
export type FilterVerbs = "where" | "and" | "or";

export type Filter = {
  column: Column;
  columnName: string;
  columnLabel: string;
  condition: FilterConditions;
  value: string;
};

const FilterRow = ({
  columns,
  filter,
  idx,
}: {
  columns: Column[];
  filter: Filter;
  idx: number;
}) => {
  const { removeFilter, updateFilter } = useFilters();
  const verb = useMemo(() => (idx === 0 ? "where" : "and"), [idx]);

  const changeFilterColumn = (columnName: string) => {
    const column = columns.find(c => c.name === columnName) as Column
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
        {/* <pre>{JSON.stringify(filter, null, 2)}</pre> */}
        <Button size="xs" onClick={() => removeFilter(idx)}>
          <XIcon className="h-12" />
        </Button>
        <div className="min-w-[50px]">
          {verb}
        </div>
        <FormControl id="columns">
          <Select
            size="sm"
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
        <ConditionComponent filter={filter} onChange={(value: FilterConditions) => changeFilterCondition(value)} />
        <FormControl id="value">
          <Input
            size="sm"
            value={filter.value}
            onChange={(e) => changeFilterValue(e.currentTarget.value)}
          />
        </FormControl>
      </div>
    </>
  );
};

export default FilterRow;

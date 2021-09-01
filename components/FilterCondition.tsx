import { Column } from "@/features/fields/types";
import { FormControl, Input, Select } from "@chakra-ui/react";
import React from "react";

export enum FilterConditions {
  is = "is",
  is_not = "is_not",
  contains = "contains",
  not_contains = "not_contains",
  starts_with = "starts_with",
  ends_with = "ends_with",
  is_empty = "is_empty",
  is_not_empty = "is_not_empty",
}

export type FilterVerbs = "where" | "and" | "or";

export type Filter = {
  columnName: string;
  columnLabel: string;
  verb: FilterVerbs;
  condition: FilterConditions;
  value: string;
};

const FilterCondition = ({
  columns,
  filter,
  filters,
  idx,
  onChange
}: {
  columns: Column[];
  filter: Filter;
  filters: Filter[];
  idx: number;
  onChange: (filter: Filter) => void;
}) => {
  console.log(1, filter);

  // const verb = useMemo(() => {
  //   idx === 0 ? 'where' : 'and'
  // }, [filters])

  // const [columnName, setColumnName] = useState('')

  const conditions = [
    "is",
    "is_not",
    "contains",
    "not_contains",
    "starts_with",
    "ends_with",
    "is_empty",
    "is_not_empty",
  ];

  const changeFilterColumn = (columnName: string) => {
    onChange({
      ...filter,
      columnName
    })
  }

  const changeFilterCondition = (condition: FilterConditions) => {
    onChange({
      ...filter,
      condition
    })
  }

  const changeFilterValue = (value: string) => {
    onChange({
      ...filter,
      value
    })
  }

  return (
    <>
      <div className="flex w-full">
        <div>{filter.verb}</div>
        <FormControl id="columns">
          <Select
            value={filter.columnName}
            onChange={(e) => changeFilterColumn(e.currentTarget.value)}
          >
            {columns &&
              columns.map((column, idx) => (
                <option key={idx} value={column?.id as any}>
                  {column.label}
                </option>
              ))}
          </Select>
        </FormControl>
        <FormControl id="condition">
          <Select
            value={filter.condition}
            onChange={(e) => changeFilterCondition(e.currentTarget.value as FilterConditions)}
          >
            {conditions.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl id="condition">
          <Input
            value={filter.value}
            onChange={(e) => changeFilterValue(e.currentTarget.value)}
          />
        </FormControl>
      </div>
    </>
  );
};

export default FilterCondition

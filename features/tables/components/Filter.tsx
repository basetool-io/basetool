import { BooleanFilterConditions } from "@/features/tables/components/BooleanConditionComponent";
import { Button, FormControl, Input, Select, Tooltip } from "@chakra-ui/react";
import { Column } from "@/features/fields/types";
import { IntFilterConditions } from "@/features/tables/components/IntConditionComponent";
import { StringFilterConditions } from "@/features/tables/components/StringConditionComponent";
import { XIcon } from "@heroicons/react/outline";
import { useFilters } from "@/hooks";
import ConditionComponent from "@/features/tables/components/ConditionComponent";
import React, { memo } from "react";

export type FilterConditions =
  | IntFilterConditions
  | StringFilterConditions
  | BooleanFilterConditions;
export type FilterVerb = FilterVerbs;

export enum FilterVerbs {
  // where = "where",
  and = "and",
  or = "or",
}

export type IFilter = {
  column: Column;
  columnName: string;
  columnLabel: string;
  condition: FilterConditions;
  value: string;
  verb: FilterVerb;
};

const CONDITIONS_WITHOUT_VALUE = [
  IntFilterConditions.is_null,
  IntFilterConditions.is_not_null,
  StringFilterConditions.is_empty,
  StringFilterConditions.is_not_empty,
  StringFilterConditions.is_null,
  StringFilterConditions.is_not_null,
  BooleanFilterConditions.is_true,
  BooleanFilterConditions.is_false,
  BooleanFilterConditions.is_null,
  BooleanFilterConditions.is_not_null,
];

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
  // const verb = useMemo(() => (idx === 0 ? "where" : "and"), [idx]);

  const changeFilterColumn = (columnName: string) => {
    const column = columns.find((c) => c.name === columnName) as Column;
    let condition;
    switch (column.fieldType) {
      case "Id":
      case "Number":
      case "Association":
        condition = IntFilterConditions.is;
        break;
      case "Boolean":
        condition = BooleanFilterConditions.is_true;
        break;
      default:
      case "Text":
        condition = StringFilterConditions.is;
        break;
    }
    updateFilter(idx, {
      ...filter,
      column,
      columnName,
      condition,
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

  const changeFilterVerb = (verb: FilterVerb) => {
    updateFilter(idx, {
      ...filter,
      verb,
    });
  };

  return (
    <>
      <div className="flex w-full items-center space-x-1">
        <Tooltip label="Remove filter">
          <Button size="xs" variant="link" onClick={() => removeFilter(idx)}>
            <XIcon className="h-5 text-gray-700" />
          </Button>
        </Tooltip>
        <FormControl id="verb" className="max-w-[75px]">
          {idx === 0 && <div className="text-gray-800 text-right text-sm font-mono">where</div>}
          {idx > 1 && (
            <div className="text-gray-800 text-right text-sm font-mono">{filter.verb}</div>
          )}

          {idx === 1 && (
            <Select
              size="sm"
              className="font-mono"
              value={filter.verb}
              onChange={(e) =>
                changeFilterVerb(e.currentTarget.value as FilterVerb)
              }
            >
              {Object.entries(FilterVerbs).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </Select>
          )}
        </FormControl>
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
        <div className="min-w-[150px] max-w-[150px]">
          {!CONDITIONS_WITHOUT_VALUE.includes(filter.condition) && (
            <FormControl id="value">
              <Input
                size="sm"
                value={filter.value}
                className="font-mono"
                onChange={(e) => changeFilterValue(e.currentTarget.value)}
              />
            </FormControl>
          )}
        </div>
      </div>
    </>
  );
};

export default memo(Filter);

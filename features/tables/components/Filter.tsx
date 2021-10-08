import { BooleanFilterConditions } from "@/features/tables/components/BooleanConditionComponent";
import { Button, FormControl, Input, Select, Tooltip } from "@chakra-ui/react";
import { Column, FieldType } from "@/features/fields/types";
import { IntFilterConditions } from "@/features/tables/components/IntConditionComponent";
import { StringFilterConditions } from "@/features/tables/components/StringConditionComponent";
import { XIcon } from "@heroicons/react/outline";
import { isUndefined } from "lodash";
import { useFilters } from "@/hooks";
import ConditionComponent from "@/features/tables/components/ConditionComponent";
import React, { memo } from "react";

export type FilterConditions =
  | IntFilterConditions
  | StringFilterConditions
  | BooleanFilterConditions;
export type FilterVerb = FilterVerbs;

export enum FilterVerbs {
  and = "and",
  or = "or",
}

export type IFilter = {
  column: Column;
  columnName: string;
  condition: FilterConditions;
  value: string;
  verb: FilterVerb;
};

export type IFilterGroup = {
  isGroup: boolean;
  verb: FilterVerb;
  filters: IFilter[];
};

export const getDefaultFilterCondition = (fieldType: FieldType) => {
  switch (fieldType) {
    case "Id":
    case "Number":
    case "Association":
      return IntFilterConditions.is;
    case "Boolean":
      return BooleanFilterConditions.is_true;
    default:
    case "Text":
      return StringFilterConditions.is;
  }
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
  parentIdx,
}: {
  columns: Column[];
  filter: IFilter;
  idx: number;
  parentIdx?: number;
}) => {
  const { filters, removeFilter, updateFilter } = useFilters();

  const changeFilterColumn = (columnName: string) => {
    const column = columns.find((c) => c.name === columnName) as Column;
    const condition = getDefaultFilterCondition(column.fieldType);

    if (!isUndefined(parentIdx)) {
      const groupFilter = filters[parentIdx] as IFilterGroup;
      const newFilters = [...groupFilter.filters];
      newFilters[idx] = {
        ...groupFilter.filters[idx],
        column,
        columnName,
        condition,
      };

      updateFilter(parentIdx, {
        ...groupFilter,
        filters: newFilters,
      });
    } else {
      updateFilter(idx, {
        ...filter,
        column,
        columnName,
        condition,
      });
    }
  };

  const changeFilterCondition = (condition: FilterConditions) => {
    if (!isUndefined(parentIdx)) {
      const groupFilter = filters[parentIdx] as IFilterGroup;
      const newFilters = [...groupFilter.filters];
      newFilters[idx] = {
        ...groupFilter.filters[idx],
        condition,
      };

      updateFilter(parentIdx, {
        ...groupFilter,
        filters: newFilters,
      });
    } else {
      updateFilter(idx, {
        ...filter,
        condition,
      });
    }
  };

  const changeFilterValue = (value: string) => {
    if (!isUndefined(parentIdx)) {
      const groupFilter = filters[parentIdx] as IFilterGroup;
      const newFilters = [...groupFilter.filters];
      newFilters[idx] = {
        ...groupFilter.filters[idx],
        value,
      };

      updateFilter(parentIdx, {
        ...groupFilter,
        filters: newFilters,
      });
    } else {
      updateFilter(idx, {
        ...filter,
        value,
      });
    }
  };

  const changeFilterVerb = (verb: FilterVerb) => {
    if (!isUndefined(parentIdx)) {
      const groupFilter = filters[parentIdx] as IFilterGroup;
      const newFilters = [...groupFilter.filters];
      newFilters.forEach(
        (filter, i) =>
          (newFilters[i] = {
            ...groupFilter.filters[i],
            verb,
          })
      );

      updateFilter(parentIdx, {
        ...groupFilter,
        filters: newFilters,
      });
    } else {
      updateFilter(idx, {
        ...filter,
        verb,
      });
    }
  };

  const removeFilterMethod = () => {
    if (!isUndefined(parentIdx)) {
      const groupFilter = filters[parentIdx] as IFilterGroup;
      const newFilters = [...groupFilter.filters];
      if (newFilters.length > 1) {
        newFilters.splice(idx, 1);

        updateFilter(parentIdx, {
          ...groupFilter,
          filters: newFilters,
        });
      } else {
        removeFilter(parentIdx);
      }
    } else {
      removeFilter(idx);
    }
  };

  return (
    <>
      <div className="flex w-full items-center space-x-1">
        <FormControl id="verb" className="min-w-[65px] max-w-[65px]">
          {idx === 0 && (
            <div className="text-gray-800 text-right text-sm font-mono">
              where
            </div>
          )}
          {idx > 1 && (
            <div className="text-gray-800 text-right text-sm font-mono">
              {filter.verb}
            </div>
          )}

          {idx === 1 && (
            <Select
              size="xs"
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
        <FormControl id="columns" className="min-w-[140px] max-w-[140px]">
          <Select
            size="xs"
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
        <div
          className={
            !isUndefined(parentIdx) ||
            !filters.find((filter) => "isGroup" in filter)
              ? "min-w-[100px] max-w-[100px]"
              : "min-w-[210px]"
          }
        >
          {!CONDITIONS_WITHOUT_VALUE.includes(filter.condition) && (
            <FormControl id="value">
              <Input
                size="xs"
                value={filter.value}
                className="font-mono"
                onChange={(e) => changeFilterValue(e.currentTarget.value)}
              />
            </FormControl>
          )}
        </div>
        <Tooltip label="Remove filter">
          <Button size="xs" variant="link" onClick={() => removeFilterMethod()}>
            <XIcon className="h-3 text-gray-700" />
          </Button>
        </Tooltip>
      </div>
    </>
  );
};

export default memo(Filter);

import {
  BooleanFilterConditions,
  DateFilterConditions,
  IntFilterConditions,
  SelectFilterConditions,
  StringFilterConditions,
  getDefaultFilterCondition,
} from "..";
import { Button, FormControl, Input, Select, Tooltip } from "@chakra-ui/react";
import { CalendarIcon, XIcon } from "@heroicons/react/outline";
import { Column } from "@/features/fields/types";
import { FilterConditions, IFilter, IFilterGroup } from "../types";
import { isArray, isDate, isUndefined } from "lodash";
import { useFilters } from "@/features/records/hooks";
import ConditionComponent from "@/features/tables/components/ConditionComponent";
import DatePicker from "react-datepicker";
import React, { forwardRef, memo, useMemo, useState } from "react";
import VerbComponent, { FilterVerb } from "./VerbComponent";

const IS_VALUES = {
  today: "today",
  tomorrow: "tomorrow",
  yesterday: "yesterday",
  one_week_ago: "one_week_ago",
  one_week_from_now: "one_week_from_now",
  one_month_ago: "one_month_ago",
  one_month_from_now: "one_month_from_now",
  exact_date: "exact_date",
};

const WITHIN_VALUES = {
  past_week: "past_week",
  next_week: "next_week",
  past_month: "past_month",
  next_month: "next_month",
  past_year: "past_year",
  next_year: "next_year",
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
  DateFilterConditions.is_empty,
  DateFilterConditions.is_not_empty,
  DateFilterConditions.is_null,
  DateFilterConditions.is_not_null,
  SelectFilterConditions.is_empty,
  SelectFilterConditions.is_not_empty,
  SelectFilterConditions.is_null,
  SelectFilterConditions.is_not_null,
];

// This input is used for selecting exact date for date filter.
const CustomDateInput = forwardRef(
  (
    {
      onClick,
    }: {
      onClick?: (e: any) => void;
    },
    ref: any
  ) => {
    return (
      <Button
        size="xs"
        onClick={onClick}
        ref={ref}
        className="p-0 flex h-full w-full justify-center items-center"
      >
        <CalendarIcon className="h-3" />
      </Button>
    );
  }
);
CustomDateInput.displayName = "CustomDateInput";

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
  const [localInputValue, setLocalInputValue] = useState(filter.value);

  const isDateFilter = useMemo(
    () => filter.column.fieldType === "DateTime",
    [filter.column.fieldType]
  );
  const isSelectFilter = useMemo(
    () => filter.column.fieldType === "Select",
    [filter.column.fieldType]
  );

  const isSelectWithValueInput = useMemo(
    () =>
      filter.condition === SelectFilterConditions.contains ||
      filter.condition === SelectFilterConditions.not_contains,
    [filter.condition]
  );

  const changeFilterColumn = (columnName: string) => {
    const column = columns.find((c) => c.name === columnName) as Column;
    const condition = getDefaultFilterCondition(column.fieldType);

    let option;
    if (filter.column.fieldType === "DateTime") {
      option = "today";
    }

    let value = "";
    if (column.fieldType === "Select") {
      value = (column?.fieldOptions?.options as string).split(",")[0].trim();
    }

    // If the filter is in a group (!isUndefined(parentIdx)), we need to update the filters array of that group.
    if (!isUndefined(parentIdx)) {
      const groupFilter = filters[parentIdx] as IFilterGroup;
      const newFilters = [...groupFilter.filters];
      newFilters[idx] = {
        ...groupFilter.filters[idx],
        column,
        columnName,
        condition,
        option,
        value,
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
        option,
        value,
      });
    }
  };

  const changeFilterCondition = (condition: FilterConditions) => {
    let option;
    if (filter.column.fieldType === "DateTime") {
      if (condition === DateFilterConditions.is_within) {
        option = "past_week";
      } else {
        option = "today";
      }
    }

    if (!isUndefined(parentIdx)) {
      const groupFilter = filters[parentIdx] as IFilterGroup;
      const newFilters = [...groupFilter.filters];
      newFilters[idx] = {
        ...groupFilter.filters[idx],
        condition,
        option,
      };

      updateFilter(parentIdx, {
        ...groupFilter,
        filters: newFilters,
      });
    } else {
      updateFilter(idx, {
        ...filter,
        condition,
        option,
      });
    }
  };

  const changeFilterOption = (option: string) => {
    if (!isUndefined(parentIdx)) {
      const groupFilter = filters[parentIdx] as IFilterGroup;
      const newFilters = [...groupFilter.filters];
      newFilters[idx] = {
        ...groupFilter.filters[idx],
        option,
        value: "",
      };

      updateFilter(parentIdx, {
        ...groupFilter,
        filters: newFilters,
      });
    } else {
      updateFilter(idx, {
        ...filter,
        option,
        value: "",
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

  const handleChangeDate = (date: Date | [Date | null, Date | null] | null) => {
    const value = isArray(date) ? [date[0], date[1]] : date;

    if (isDate(value)) {
      value.setUTCHours(0, 0, 0, 0);
      changeFilterValue(value.toUTCString());
    }
  };

  return (
    <>
      <div className="flex w-full items-center space-x-1">
        <VerbComponent
          idx={idx}
          verb={filter.verb}
          onChange={(value: FilterVerb) => changeFilterVerb(value)}
        />
        <FormControl id="columns" className="min-w-[140px] max-w-[140px]">
          <Select
            size="xs"
            className="font-mono"
            value={filter.columnName}
            onChange={(e) => changeFilterColumn(e.currentTarget.value)}
          >
            {columns &&
              columns
                .filter((column) => !column.baseOptions.computed)
                .map((column, idx) => (
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
            <>
              {isSelectFilter && !isSelectWithValueInput && (
                <FormControl id="value">
                  <Select
                    size="xs"
                    className="font-mono"
                    defaultValue={filter.value}
                    onChange={(e) => changeFilterValue(e.currentTarget.value)}
                  >
                    {filter.column?.fieldOptions?.options &&
                      (filter.column.fieldOptions.options as any)
                        .split(",")
                        .map((option: string, index: number) => (
                          <option key={index} value={option.trim()}>
                            {option.trim()}
                          </option>
                        ))}
                  </Select>
                </FormControl>
              )}
              {isDateFilter && (
                <FormControl id="option">
                  <div className="flex space-x-1">
                    <Tooltip
                      label="Dates are in server timezone (UTC)."
                      fontSize="xs"
                    >
                      <Select
                        size="xs"
                        className="font-mono"
                        value={filter.option}
                        onChange={(e) =>
                          changeFilterOption(e.currentTarget.value)
                        }
                      >
                        {filter.condition !== DateFilterConditions.is_within &&
                          Object.entries(IS_VALUES).map(([id, label]) => (
                            <option key={id} value={id}>
                              {label.replaceAll("_", " ")}
                            </option>
                          ))}
                        {filter.condition === DateFilterConditions.is_within &&
                          Object.entries(WITHIN_VALUES).map(([id, label]) => (
                            <option key={id} value={id}>
                              {label.replaceAll("_", " ")}
                            </option>
                          ))}
                      </Select>
                    </Tooltip>
                    {filter.option === "exact_date" && (
                      <div className="flex-1">
                        <DatePicker
                          selected={
                            filter.value !== ""
                              ? new Date(filter.value as string)
                              : new Date()
                          }
                          onChange={handleChangeDate}
                          customInput={<CustomDateInput />}
                        />
                      </div>
                    )}
                  </div>
                </FormControl>
              )}
              {((!isSelectFilter && !isDateFilter) ||
                (isSelectFilter && isSelectWithValueInput)) && (
                <FormControl id="value">
                  <Input
                    size="xs"
                    value={localInputValue}
                    className="font-mono"
                    onChange={(e) => setLocalInputValue(e.currentTarget.value)}
                    // This is a workaround to avoid the input to lose focus when typing.
                    onBlur={() => changeFilterValue(localInputValue)}
                  />
                </FormControl>
              )}
            </>
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

import {
  BooleanFilterConditions,
  DateFilterConditions,
  FilterVerbs,
  IntFilterConditions,
  SelectFilterConditions,
  StringFilterConditions,
  getDefaultFilterCondition,
} from "..";
import { Button, FormControl, Input, Select, Tooltip } from "@chakra-ui/react";
import { CalendarIcon } from "@heroicons/react/outline";
import { Column } from "@/features/fields/types";
import { FilterConditions, IFilter, IFilterGroup } from "../types";
import { GenericEvent } from "@/types";
import { isArray, isDate, isUndefined } from "lodash";
import { useFilters } from "@/features/records/hooks";
import ConditionComponent from "@/features/tables/components/ConditionComponent";
import DatePicker from "react-datepicker";
import FilterTrashIcon from "./FilterTrashIcon"
import React, { forwardRef, memo, useMemo, useState } from "react";
import VerbComponent from "./VerbComponent";

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
      onClick?: (e: GenericEvent) => void;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

const TextInputSelector = ({
  value,
  onChange,
  onBlur,
}: {
  value: string | undefined;
  onChange: (e: GenericEvent) => void;
  onBlur: (e: GenericEvent) => void;
}) => (
  <FormControl>
    <Input size="xs" value={value} onBlur={onBlur} onChange={onChange} />
  </FormControl>
);

const SelectFieldTypeSelector = ({
  options,
  defaultValue,
  onChange,
}: {
  options: string | undefined;
  defaultValue: string | undefined;
  onChange: (e: GenericEvent) => void;
}) => (
  <FormControl>
    <Select size="xs" defaultValue={defaultValue} onChange={onChange}>
      {options &&
        options.split(",").map((option: string, index: number) => (
          <option key={index} value={option.trim()}>
            {option.trim()}
          </option>
        ))}
    </Select>
  </FormControl>
);

const DateSelector = ({
  filter,
  onChange,
  onChangeDate,
}: {
  filter: IFilter;
  onChange: (e: GenericEvent) => void;
  onChangeDate: (date: Date | [Date | null, Date | null] | null) => void;
}) => {
  const options = useMemo(
    () =>
      filter.condition === DateFilterConditions.is_within
        ? WITHIN_VALUES
        : IS_VALUES,
    [filter.condition]
  );

  return (
    <FormControl>
      <div className="flex space-x-1">
        <Tooltip label="Dates are in server timezone (UTC)." fontSize="xs">
          <Select size="xs" value={filter.option} onChange={onChange}>
            {Object.entries(options).map(([id, label]) => (
              <option key={id} value={id}>
                {label.replaceAll("_", " ")}
              </option>
            ))}
          </Select>
        </Tooltip>
        {filter.option === "exact_date" && (
          <div className="flex-1">
            <DatePicker
              showTimeSelect={true}
              selected={
                filter.value !== ""
                  ? new Date(filter.value as string)
                  : new Date()
              }
              onChange={onChangeDate}
              customInput={<CustomDateInput />}
            />
          </div>
        )}
      </div>
    </FormControl>
  );
};

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

    // Get the default condition and option/value for the new filter.
    const condition = getDefaultFilterCondition(column.fieldType);
    let option;
    if (column.fieldType === "DateTime") {
      option = "today";
    }
    let value;
    if (column.fieldType === "Select") {
      value =
        (column?.fieldOptions?.options as string).split(",")[0].trim() || "";
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
    if (isDateFilter) {
      if (condition === DateFilterConditions.is_within) {
        option = "past_week";
      } else if (
        condition === DateFilterConditions.is ||
        condition === DateFilterConditions.is_not ||
        condition === DateFilterConditions.is_before ||
        condition === DateFilterConditions.is_after ||
        condition === DateFilterConditions.is_on_or_before ||
        condition === DateFilterConditions.is_on_or_after
      ) {
        option = "today";
      }
    }

    const isSelectFilterWithoutValue =
      isSelectFilter &&
      (condition === SelectFilterConditions.is_empty ||
        condition === SelectFilterConditions.is_not_empty ||
        condition === SelectFilterConditions.is_null ||
        condition === SelectFilterConditions.is_not_null);

    if (!isUndefined(parentIdx)) {
      const groupFilter = filters[parentIdx] as IFilterGroup;
      const newFilters = [...groupFilter.filters];
      newFilters[idx] = {
        ...groupFilter.filters[idx],
        condition,
        option,
        value: isSelectFilterWithoutValue ? "" : groupFilter.filters[idx].value,
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
        value: isSelectFilterWithoutValue ? "" : filter.value,
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

  const changeFilterVerb = (verb: FilterVerbs) => {
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

  const handleRemoveFilter = () => {
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

  const isWithoutValue = useMemo(
    () => CONDITIONS_WITHOUT_VALUE.includes(filter.condition),
    [filter.condition]
  );

  const hasTextInputSelector = useMemo(
    () =>
      (!isSelectFilter && !isDateFilter) ||
      (isSelectFilter && isSelectWithValueInput),
    [isSelectFilter, isDateFilter, isSelectWithValueInput]
  );

  const isSelectFieldType = useMemo(
    () => isSelectFilter && !isSelectWithValueInput,
    [isSelectFilter, isSelectWithValueInput]
  );

  const ColumnsSelector = () => (
    <FormControl className="flex-1">
      <Select
        size="xs"
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
  );

  const ValueSelector = useMemo(() => {
    if (isWithoutValue) return <div></div>;
    if (isSelectFieldType)
      return (
        <SelectFieldTypeSelector
          defaultValue={filter.value}
          options={filter.column?.fieldOptions?.options as string}
          onChange={(e: GenericEvent) =>
            changeFilterValue(e?.currentTarget?.value)
          }
        />
      );
    if (isDateFilter)
      return (
        <DateSelector
          filter={filter}
          onChange={(e: GenericEvent) =>
            changeFilterOption(e.currentTarget.value)
          }
          onChangeDate={handleChangeDate}
        />
      );
    if (hasTextInputSelector)
      return (
        <TextInputSelector
          value={localInputValue}
          onChange={(e: GenericEvent) =>
            setLocalInputValue(e.currentTarget.value)
          }
          onBlur={() => changeFilterValue(localInputValue || "")}
        />
      );

    return <div></div>;
  }, [localInputValue, isSelectFieldType, isDateFilter, hasTextInputSelector]);

  return (
    <>
      <div className="flex-1 flex flex-col sm:flex-row w-full sm:w-auto sm:items-center sm:space-x-2">
        <div className="flex w-16">
          <VerbComponent
            idx={idx}
            verb={filter.verb}
            onChange={(value: FilterVerbs) => changeFilterVerb(value)}
          />
        </div>
        <div className="flex-1 grid grid-cols-3 gap-2 font-mono">
          <ColumnsSelector />
          <ConditionComponent
            filter={filter}
            onChange={(value: FilterConditions) => changeFilterCondition(value)}
          />
          {ValueSelector}
        </div>
        <FilterTrashIcon onClick={handleRemoveFilter} />
      </div>
    </>
  );
};

export default memo(Filter);

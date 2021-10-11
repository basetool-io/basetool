import { IFilter } from "@/features/tables/components/Filter";
import ConditionSelect from "./ConditionSelect";
import React from "react";

export enum DateFilterConditions {
  is = "is",
  is_not = "is_not",
  is_before = "is_before",
  is_after = "is_after",
  is_on_or_before = "is_on_or_before",
  is_on_or_after = "is_on_or_after",
  is_within = "is_within",
  is_empty = "is_empty",
  is_not_empty = "is_not_empty",
  is_null = "is_null",
  is_not_null = "is_not_null",
}

export const IS_VALUES = {
  today: "today",
  tomorrow: "tomorrow",
  yesterday: "yesterday",
  one_week_ago: "one_week_ago",
  one_week_from_now: "one_week_from_now",
  one_month_ago: "one_month_ago",
  one_month_from_now: "one_month_from_now",
  exact_date: "exact_date",
}

export const WITHIN_VALUES = {
  past_week: "past_week",
  next_week: "next_week",
  past_month: "past_month",
  next_month: "next_month",
  past_year: "past_year",
  next_year: "next_year",
}

function DateConditionComponent({
  filter,
  onChange,
}: {
  filter: IFilter;
  onChange: (condition: DateFilterConditions) => void;
}) {
  return (
    <ConditionSelect
      value={filter.condition}
      options={Object.entries(DateFilterConditions)}
      onChange={(value: unknown) => onChange(value as DateFilterConditions)}
    />
  );
}

export default DateConditionComponent;

import { Column } from "@/features/fields/types";
import { FormLabel, Select } from "@chakra-ui/react";
import { humanize } from "@/lib/humanize";
import { isEmpty, merge } from "lodash";
import OptionWrapper from "@/features/tables/components/OptionsWrapper";
import React, { useEffect, useState } from "react";
import fieldOptions from "./fieldOptions";

function Inspector({
  column,
  setColumnOptions,
}: {
  column: Column;
  setColumnOptions: (c: Column, options: Record<string, unknown>) => void;
}) {
  const selectOptions = ["date_time", "only_date", "only_time"];
  const [selectValue, setSelectValue] = useState("date_time");
  const columnFieldOptions = merge(fieldOptions, column.fieldOptions);

  // Respond to select changes
  useEffect(() => {
    switch (selectValue) {
      case "date_time":
        setColumnOptions(column, {
          "fieldOptions.showDate": true,
          "fieldOptions.showTime": true,
        });
        break;
      case "only_date":
        setColumnOptions(column, {
          "fieldOptions.showDate": true,
          "fieldOptions.showTime": false,
        });
        break;
      case "only_time":
        setColumnOptions(column, {
          "fieldOptions.showDate": false,
          "fieldOptions.showTime": true,
        });
        break;
    }
  }, [selectValue]);

  // Setting the defaults
  useEffect(() => {
    if (!isEmpty(columnFieldOptions)) {
      const defaults = Object.fromEntries(
        Object.entries(columnFieldOptions).map(([key, value]) => [
          `fieldOptions.${key}`,
          value,
        ])
      );
      if (columnFieldOptions.showDate) {
        if (columnFieldOptions.showTime) {
          setSelectValue("date_time");
        } else {
          setSelectValue("only_date");
        }
      } else if (columnFieldOptions.showTime) {
        setSelectValue("only_time");
      }
      setColumnOptions(column, defaults);
    }
  }, []);

  return (
    <OptionWrapper helpText="Control what kind of information this field has.">
      <FormLabel htmlFor={`dateTime-${column.name}`}>
        Type of picker
      </FormLabel>
      <Select
        id={`dateTime-${column.name}`}
        value={selectValue}
        onChange={(e) => setSelectValue(e.currentTarget.value)}
      >
        {selectOptions.map((option) => (
          <option key={option} value={option}>
            {option === "date_time" ? "Date & time" : humanize(option)}
          </option>
        ))}
      </Select>
    </OptionWrapper>
  );
}

export default Inspector;

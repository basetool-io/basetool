import { InspectorProps } from "@/features/fields/types";
import { Select } from "@chakra-ui/react";
import { humanize } from "@/lib/humanize";
import { isEmpty, merge } from "lodash";
import OptionWrapper from "@/features/views/components/OptionWrapper";
import React, { useEffect, useState } from "react";
import fieldOptions from "./fieldOptions";

function Inspector({ column, setColumnOptions }: InspectorProps) {
  const selectOptions = ["date_time", "only_date", "only_time"];
  const [selectValue, setSelectValue] = useState("date_time");
  const options = merge(fieldOptions, column.fieldOptions);

  // Respond to select changes
  useEffect(() => {
    switch (selectValue) {
      case "date_time":
        setColumnOptions(column.name, {
          "fieldOptions.showDate": true,
          "fieldOptions.showTime": true,
        });
        break;
      case "only_date":
        setColumnOptions(column.name, {
          "fieldOptions.showDate": true,
          "fieldOptions.showTime": false,
        });
        break;
      case "only_time":
        setColumnOptions(column.name, {
          "fieldOptions.showDate": false,
          "fieldOptions.showTime": true,
        });
        break;
    }
  }, [selectValue]);

  // Setting the defaults
  useEffect(() => {
    if (!isEmpty(options)) {
      if (options.showDate) {
        if (options.showTime) {
          setSelectValue("date_time");
        } else {
          setSelectValue("only_date");
        }
      } else if (options.showTime) {
        setSelectValue("only_time");
      }
    }
  }, []);

  return (
    <OptionWrapper
      helpText="Control what kind of information this field has."
      label="Type of picker"
    >
      <Select
        id={`type_of_picker`}
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

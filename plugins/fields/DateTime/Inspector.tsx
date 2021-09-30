import { Checkbox, FormLabel } from "@chakra-ui/react";
import { Column } from "@/features/fields/types";
import { isUndefined } from "lodash";
import OptionWrapper from "@/features/tables/components/OptionsWrapper";
import React, { useEffect } from "react";

function Inspector({
  column,
  setColumnOption,
}: {
  column: Column;
  setColumnOption: (c: Column, name: string, value: any) => void;
}) {
  // We'll check the column type first
  const initialValue = !isUndefined(column.fieldOptions.onlyDate)
    ? column.fieldOptions.onlyDate
    : column.dataSourceInfo.type === "date";

  // when changing the field type to this one, the new options are not automatically passed to the column
  useEffect(() => {
    setColumnOption(column, "fieldOptions.onlyDate", initialValue);
  }, []);

  return (
    <OptionWrapper helpText="When you want your users to be able to change only the date and not the time.">
      <FormLabel>Only date</FormLabel>
      <Checkbox
        isChecked={column.fieldOptions.onlyDate as boolean}
        onChange={() =>
          setColumnOption(
            column,
            "fieldOptions.onlyDate",
            !column.fieldOptions.onlyDate
          )
        }
      >
        Show only date picker
      </Checkbox>
    </OptionWrapper>
  );
}

export default Inspector;

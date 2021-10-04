import { Column } from "@/features/fields/types";
import {
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import OptionWrapper from "@/features/tables/components/OptionsWrapper";
import React from "react";

function Inspector({
  column,
  setColumnOptions,
}: {
  column: Column;
  setColumnOptions: (c: Column, options: Record<string, unknown>) => void;
}) {

  return (
    <>
      <OptionWrapper helpText="Value that has to be computed.">
        <FormControl id="value">
          <FormLabel>Value</FormLabel>
          <Input
            type="text"
            name="value"
            placeholder="Value"
            required={true}
            value={column.fieldOptions.value as string}
            onChange={(e) => {
              setColumnOptions(column, {
                "fieldOptions.value": e.currentTarget.value,
              });
            }}
          />
          {/* <FormHelperText>Add the values comma separated.</FormHelperText> */}
        </FormControl>
      </OptionWrapper>
    </>
  );
}

export default Inspector;

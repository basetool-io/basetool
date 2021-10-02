import { Column } from "@/features/fields/types";
import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import OptionWrapper from "@/features/tables/components/OptionsWrapper";
import React, { useEffect } from "react";
import fieldOptions from "./fieldOptions";

function Inspector({
  column,
  setColumnOption,
}: {
  column: Column;
  setColumnOption: (c: Column, name: string, value: any) => void;
}) {


  return (
    <OptionWrapper>
      <FormControl id="#">
        <FormLabel></FormLabel>
        <Input
         />
      </FormControl>
    </OptionWrapper>
  );
}

export default Inspector;

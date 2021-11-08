import {
  Code,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { Column } from "@/features/fields/types";
import OptionWrapper from "@/features/tables/components/OptionsWrapper";
import React from "react";

type Props = {
  localColumn: Column;
  setColumnOptions: (column: Column, options: Record<string, unknown>) => void;
};

const BackgroundColorOption = ({ localColumn, setColumnOptions }: Props) => {
  return (
    <OptionWrapper fullWidth>
      <FormControl id="backgroundColor">
        <FormLabel>Background color</FormLabel>
        <Input
          type="text"
          name="backgroundColor"
          placeholder="{{ value.toLowerCase().includes('ok') ? 'green' : 'yellow'}}"
          required={false}
          className="font-mono w-full"
          value={localColumn.baseOptions.backgroundColor}
          onChange={(e) =>
            setColumnOptions(localColumn, {
              "baseOptions.backgroundColor": e.currentTarget.value,
            })
          }
        />
        <FormHelperText>
          You may use any html and hex color. <br /> We provide very good defaults for the following colors <Code>blue</Code>, <Code>red</Code>, <Code>green</Code>, <Code>yellow</Code>, <Code>orange</Code>, <Code>pink</Code>, <Code>purple</Code>, <Code>gray</Code>,
        </FormHelperText>
      </FormControl>
    </OptionWrapper>
  );
};

export default BackgroundColorOption;

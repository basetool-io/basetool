import {
  Input,
} from "@chakra-ui/react";
import { debounce, isString } from "lodash";
import { useSegment } from "@/hooks";
import { useUpdateColumn } from "../hooks";
import OptionWrapper from "@/features/tables/components/OptionsWrapper";
import React, { useCallback, useEffect, useState } from "react";

const PlaceholderOption = () => {
  const track = useSegment();

  const { column, columnOptions, setColumnOptions } = useUpdateColumn();
  const [value, setValue] = useState<string>();

  const debouncedSetColumnOptions = useCallback(
    debounce(setColumnOptions, 1000),
    []
  );

  const updateValue = (event: any) => {
    setValue(event.currentTarget.value);
    if (column)
      debouncedSetColumnOptions(column.name, {
        "baseOptions.placeholder": event.currentTarget.value,
      });
  };

  useEffect(() => {
    if (isString(column?.baseOptions?.placeholder))
      setValue(column?.baseOptions?.placeholder);
  }, [column?.baseOptions?.placeholder]);

  if (!column) return null;

  return (
    <OptionWrapper
      helpText={`Whatever you pass in here will be a short hint that describes the expected value of this field.`}
      id="placeholder"
      label="Placeholder"
    >
      <Input
        type="text"
        name="placeholder value"
        placeholder="Placeholder value"
        required={false}
        value={value}
        onChange={updateValue}
      />
    </OptionWrapper>
  );
};

export default PlaceholderOption;

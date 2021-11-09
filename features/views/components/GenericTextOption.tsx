import { FormHelperText, Input } from "@chakra-ui/react";
import { debounce, isString, snakeCase } from "lodash";
import { useSegment } from "@/hooks";
import { useUpdateColumn } from "../hooks";
import OptionWrapper from "@/features/views/components/OptionsWrapper";
import React, { ReactNode, useCallback, useEffect, useState } from "react";

type Props = {
  helpText: string | ReactNode;
  id?: string;
  label: string;
  optionKey: string;
  placeholder?: string;
  formHelperText?: string | ReactNode;
  children?: ReactNode;
  defaultValue?: string;
  className?: string;
  size?: "sm" | "md";
};

const GenericTextOption = ({
  helpText,
  id,
  label,
  optionKey,
  placeholder,
  formHelperText,
  children,
  defaultValue,
  className,
  size = "sm",
}: Props) => {
  id ||= snakeCase(label.toLowerCase());
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
        [optionKey]: event.currentTarget.value,
      });
  };

  useEffect(() => {
    if (isString(defaultValue)) setValue(defaultValue);
  }, [defaultValue]);

  if (!column) return null;

  return (
    <OptionWrapper helpText={helpText} id={id} label={label}>
      <Input
        type="text"
        className={className}
        name={id}
        size={size}
        placeholder={placeholder}
        required={false}
        value={value}
        onChange={updateValue}
      />
      {formHelperText && <FormHelperText>{formHelperText}</FormHelperText>}
    </OptionWrapper>
  );
};

export default GenericTextOption;

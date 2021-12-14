import { FormHelperText, Select } from "@chakra-ui/react";
import { isString, snakeCase } from "lodash";
import { useSegment } from "@/hooks";
import { useUpdateColumn } from "../hooks";
import OptionWrapper from "@/features/views/components/OptionWrapper";
import React, { ReactNode, useEffect, useState } from "react";
import Shimmer from "@/components/Shimmer";

type Props = {
  id?: string;
  label: string;
  options: { id: string; label: string }[];
  optionKey: string;
  helpText?: string | ReactNode;
  placeholder?: string;
  formHelperText?: string | ReactNode;
  children?: ReactNode;
  defaultValue?: string;
  className?: string;
  size?: "sm" | "md";
  isLoading?: boolean;
};

const GenericSelectOption = ({
  helpText,
  id,
  label,
  options = [],
  optionKey,
  placeholder,
  formHelperText,
  defaultValue,
  className,
  size = "sm",
  isLoading = false,
}: Props) => {
  id ||= snakeCase(label.toLowerCase());
  const track = useSegment();

  const { column, columnOptions, setColumnOptions } = useUpdateColumn();
  const [value, setValue] = useState<string>();

  const handleOnChange = (event: any) => {
    setValue(event.currentTarget.value);
    if (column) {
      track("Updated column option.", {
        id,
        type: "text",
      });

      setColumnOptions(column.name, {
        [optionKey]: event.currentTarget.value,
      });
    }
  };

  useEffect(() => {
    if (isString(defaultValue)) setValue(defaultValue);
  }, [defaultValue]);

  if (!column) return null;

  return (
    <OptionWrapper helpText={helpText} id={id} label={label}>
      {isLoading && <Shimmer height={32} width={"100%"} />}
      {!isLoading && (
        <Select
          className={className}
          name={id}
          size={size}
          placeholder={placeholder}
          value={value}
          onChange={handleOnChange}
        >
          {options.map(({ id, label }, idx: number) => (
            <option value={id} key={idx}>
              {label}
            </option>
          ))}
        </Select>
      )}
      {formHelperText && <FormHelperText>{formHelperText}</FormHelperText>}
    </OptionWrapper>
  );
};

export default GenericSelectOption;

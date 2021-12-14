import { FormHelperText, Input } from "@chakra-ui/react";
import { debounce, isString, snakeCase } from "lodash";
import { useSegment } from "@/hooks";
import { useUpdateWidget } from "../hooks";
import OptionWrapper from "@/features/views/components/OptionWrapper";
import React, { ReactNode, useCallback, useEffect, useState } from "react";

type Props = {
  helpText: string | ReactNode;
  id?: string;
  label: string;
  placeholder?: string;
  formHelperText?: string | ReactNode;
  children?: ReactNode;
  defaultValue?: string;
  className?: string;
  size?: "sm" | "md";
  optionKey: string;
};

const GenericTextOption = ({
  helpText,
  id,
  label,
  placeholder,
  formHelperText,
  children,
  defaultValue,
  className,
  size = "sm",
  optionKey,
}: Props) => {
  id ||= snakeCase(label.toLowerCase());
  const track = useSegment();

  const { widget, setWidgetOptions } = useUpdateWidget();
  const [value, setValue] = useState<string>();

  const debouncedSetWidgetOptions = useCallback(
    debounce(setWidgetOptions, 1000),
    []
  );

  const handleOnChange = (event: any) => {
    setValue(event.currentTarget.value);
    if (widget) {
      track("Updated widget.", {
        id,
        type: "text",
      });

      debouncedSetWidgetOptions({
        [optionKey]: event.currentTarget.value,
      });
    }
  };

  useEffect(() => {
    if (isString(defaultValue)) setValue(defaultValue);
  }, [defaultValue]);

  if (!widget) return null;

  return (
    <OptionWrapper helpText={helpText} id={id} label={label}>
      {/* <pre>{JSON.stringify([widget, value], null, 2)}</pre> */}
      <Input
        type="text"
        className={className}
        name={id}
        size={size}
        placeholder={placeholder}
        required={false}
        value={value}
        onChange={handleOnChange}
      />
      {formHelperText && <FormHelperText>{formHelperText}</FormHelperText>}
    </OptionWrapper>
  );
};

export default GenericTextOption;

import { Checkbox, FormHelperText } from "@chakra-ui/react";
import { snakeCase } from "lodash";
import { useSegment } from "@/hooks";
import { useUpdateColumn } from "../hooks";
import OptionWrapper from "@/features/tables/components/OptionsWrapper";
import React, { ReactNode } from "react";

type Props = {
  helpText: string | ReactNode;
  id?: string;
  label: string;
  optionKey: string;
  checkboxLabel: string;
  isChecked?: boolean;
  isDisabled?: boolean;
  formHelperText?: string;
  children?: ReactNode;
};

const GenericBooleanOption = ({
  helpText,
  id,
  label,
  optionKey,
  checkboxLabel,
  isChecked,
  isDisabled,
  formHelperText,
  children
}: Props) => {
  const track = useSegment();
  id ||= snakeCase(label.toLowerCase());

  const { column, setColumnOptions } = useUpdateColumn();

  const updateValue = (event: any) => {
    if (column)
      setColumnOptions(column.name, {
        [optionKey]: event.currentTarget.checked,
      });
  };

  if (!column) return null;

  return (
    <OptionWrapper helpText={helpText} id={id} label={label}>
      <Checkbox
        id="required"
        isChecked={isChecked}
        isDisabled={isDisabled}
        onChange={updateValue}
      >
        {checkboxLabel}
      </Checkbox>
      {children}
      {formHelperText && <FormHelperText>{formHelperText}</FormHelperText>}
    </OptionWrapper>
  );
};

export default GenericBooleanOption;

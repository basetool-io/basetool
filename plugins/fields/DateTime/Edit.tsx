import { EditFieldProps } from "@/features/fields/types";
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  Input,
} from "@chakra-ui/react";
import { isArray, isDate, isFunction } from "lodash";
import DatePicker from "react-datepicker";
import EditFieldWrapper from "@/features/fields/components/FieldWrapper/EditFieldWrapper";
import React, { forwardRef, memo, useMemo, useState } from "react";
import isEmpty from "lodash/isEmpty";
import isNull from "lodash/isNull";
import parse from "html-react-parser";

const Edit = ({
  field,
  formState,
  register: registerMethod,
  setValue,
  schema,
}: EditFieldProps) => {
  const register = registerMethod(field.column.name);
  const errors = useMemo(() => formState.errors, [formState?.errors]);
  const name = useMemo(() => register.name, [register?.name]);
  const hasError = useMemo(() => !isEmpty(errors[name]), [errors[name]]);

  const helpText = field?.column?.baseOptions?.help
    ? field.column.baseOptions.help
    : null;
  const hasHelp = !isNull(helpText);
  const [placeholderValue, setPlaceholderValue] = useState<Date | null>(
    field.value ? new Date(field.value as string) : null
  );

  const getValue = (date: Date | [Date | null, Date | null] | null) =>
    isArray(date) ? [date[0], date[1]] : date;

  const handleOnChange = (date: Date | [Date | null, Date | null] | null) => {
    const value = getValue(date);

    if (isFunction(register.onBlur)) {
      register.onBlur({
        type: "blur",
        target: {
          value,
        },
      });
    }
    if (setValue) {
      setValue(register.name, isDate(value) ? value?.toISOString() : null, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
      setPlaceholderValue(value as Date | null);
    }
  };

  // options
  const placeholder = field?.column?.baseOptions?.placeholder
    ? field.column.baseOptions.placeholder
    : "";

  const CustomInput = forwardRef(
    ({ value, onClick }: { value: any; onClick: (e: any) => void }, ref) => (
      <Input
        {...register}
        onClick={onClick}
        ref={ref}
        value={value}
        placeholder={placeholder}
      />
    )
  );
  CustomInput.displayName = "CustomInput";

  // options
  const readonly = field?.column?.baseOptions?.readonly
    ? field.column.baseOptions.readonly
    : false;

  return (
    <EditFieldWrapper field={field} schema={schema}>
      <FormControl
        isInvalid={hasError && formState.isDirty}
        isDisabled={readonly}
      >
        <DatePicker
          selected={placeholderValue}
          onChange={handleOnChange}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          timeCaption="time"
          dateFormat="MMMM d, yyyy h:mm aa"
          customInput={<CustomInput {...register} placeholder={placeholder} />}
        />
        {hasHelp && <FormHelperText>{parse(helpText || "")}</FormHelperText>}
        <FormErrorMessage>{errors[name]?.message}</FormErrorMessage>
      </FormControl>
    </EditFieldWrapper>
  );
};

export default memo(Edit);

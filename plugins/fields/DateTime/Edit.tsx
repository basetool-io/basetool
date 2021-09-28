import {
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  Input,
  InputGroup,
  InputRightAddon,
} from "@chakra-ui/react";
import { CalendarIcon } from "@heroicons/react/outline";
import { DateTime } from "luxon";
import { EditFieldProps } from "@/features/fields/types";
import { dateTimeFormat, getBrowserTimezone } from "@/lib/time";
import { isArray, isDate, isFunction, isUndefined } from "lodash";
import DatePicker from "react-datepicker";
import EditFieldWrapper from "@/features/fields/components/FieldWrapper/EditFieldWrapper";
import React, { forwardRef, memo, useEffect, useMemo, useState } from "react";
import isEmpty from "lodash/isEmpty";
import isNull from "lodash/isNull";
import parse from "html-react-parser";

const CustomInput = forwardRef(
  (
    {
      onClick,
    }: {
      onClick?: (e: any) => void;
    },
    ref: any
  ) => {
    return (
      <Button
        onClick={onClick}
        ref={ref}
        className="p-0 flex h-full w-full justify-center items-center"
      >
        <CalendarIcon className="h-4" />
      </Button>
    );
  }
);
CustomInput.displayName = "CustomInput";

const Edit = ({
  field,
  formState,
  register: registerMethod,
  setValue,
  schema,
}: EditFieldProps & {
  // Pleasing TypeScript
  setValue: (name: string, value: unknown, config?: unknown) => void;
}) => {
  const timezone = getBrowserTimezone();

  const register = registerMethod(field.column.name);
  const errors = useMemo(() => formState.errors, [formState]);
  const name = useMemo(() => register.name, [register?.name]);
  const hasError = useMemo(() => !isEmpty(errors[name]), [errors[name]]);
  // keep the value in text format for easier manipulation
  const [localValue, setLocalValue] = useState("");

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

  // options
  const readonly = field?.column?.baseOptions?.readonly
    ? field.column.baseOptions.readonly
    : false;

  // const date = DateTime.fromISO(field.value as string);
  // const formattedDate = date.setZone(getBrowserTimezone()).toLocaleString(DateTime.DATETIME_MED);

  // This updates the local value when the filed loads for the first time of when a user has selected a value from the datepicker
  useEffect(() => {
    if (!isUndefined(field.value)) {
      setLocalValue(
        DateTime.fromISO(field.value as string)
          .setZone(timezone)
          .toFormat(dateTimeFormat)
      );
    }
  }, [field.value]);

  // Set the value in the formData if it's valid
  useEffect(() => {
    const value = DateTime.fromFormat(localValue, dateTimeFormat).setZone(
      timezone
    );
    if (value.isValid) {
      setValue(register.name, value.setZone("UTC").toISO());
    }
  }, [localValue]);

  // This memo holds returns the parsed value, if it's valid and if necesarry why the date is invalid.
  const [parsedValue, isValid, invalidReason] = useMemo(() => {
    const parsed = DateTime.fromFormat(localValue, dateTimeFormat).setZone(
      timezone
    );
    if (parsed.isValid) {
      return [parsed.toFormat(dateTimeFormat), parsed.isValid, null];
    }

    return [localValue, false, parsed.invalidReason];
  }, [localValue, field.value]);

  return (
    <EditFieldWrapper field={field} schema={schema}>
      <FormControl isInvalid={hasError || !isValid} isDisabled={readonly}>
        <div className="flex w-full">
          <InputGroup>
            <Input
              type="text"
              onChange={(e) => setLocalValue(e.currentTarget.value)}
              value={parsedValue}
              placeholder={placeholder}
            />

            <InputRightAddon padding={0}>
              <DatePicker
                selected={placeholderValue}
                onChange={handleOnChange}
                showTimeSelect
                timeIntervals={15}
                timeCaption="Time"
                customInput={<CustomInput />}
              />
            </InputRightAddon>
          </InputGroup>
        </div>

        {hasHelp && <FormHelperText>{parse(helpText || "")}</FormHelperText>}
        <FormHelperText>
          The date is presented in your local timezone based on your browser's
          locale information.
        </FormHelperText>
        <FormErrorMessage>{errors[name]?.message}</FormErrorMessage>
        <FormErrorMessage>{invalidReason}</FormErrorMessage>
      </FormControl>
    </EditFieldWrapper>
  );
};

export default memo(Edit);

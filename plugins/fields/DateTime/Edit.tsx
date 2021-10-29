import { BaseOptions, EditFieldProps } from "@/features/fields/types";
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
import { DateTimeFieldOptions } from "./types";
import { getBrowserTimezone, getFormatFormFieldOptions } from "@/lib/time";
import { isArray, isFunction, isNull, isString, merge } from "lodash";
import DatePicker from "react-datepicker";
import EditFieldWrapper from "@/features/fields/components/FieldWrapper/EditFieldWrapper";
import React, { memo, useEffect, useMemo, useState } from "react";
import fieldOptions from "./fieldOptions";
import isEmpty from "lodash/isEmpty";
import parse from "html-react-parser";

const FacadeButton = ({ onClick }: { onClick?: (e: any) => void }) => {
  return (
    <Button
      onClick={onClick}
      className="p-0 flex h-full w-full justify-center items-center"
    >
      <CalendarIcon className="h-4" />
    </Button>
  );
};

/**
 * For this component we have three ways of updating it
 * 1. When the component is loaded from the field value
 * 2. When the user inputs the value in the text input
 * 3. When the user picks a time and date from the date picker
 *
 * For all method to work we need to have a more complex flow to support all scenarios.
 * 1. `localValue` is the string representation of the field value in iso format. if it's empty, the value will be empty
 * 2. `textValue` is the string representation in the visual format (time/date time) for the user to update in the text field
 * 3. `datePickerValue` is the Date representation of the value. This is always a date and is passed to the DatePicker component.
 *
 * The rocket science here is to always set the `localValue` and the rest re-calculate themselves based on that.
 */
const Edit = ({
  field,
  formState,
  register: registerMethod,
  setValue,
  schema,
}: EditFieldProps) => {
  const timezone = getBrowserTimezone();
  const columnFieldOptions: DateTimeFieldOptions = useMemo(
    () => ({ ...fieldOptions, ...field.column.fieldOptions }),
    [fieldOptions, field.column]
  );
  const columnBaseOptions: BaseOptions = merge(field?.column?.baseOptions, {});
  const format = getFormatFormFieldOptions(columnFieldOptions);

  const register = registerMethod(field.column.name);
  const errors = useMemo(() => formState.errors, [formState]);
  const name = useMemo(() => register.name, [register?.name]);
  const hasError = useMemo(() => !isEmpty(errors[name]), [errors[name]]);

  const [localValue, setLocalValue] = useState(
    isString(field.value) ? field.value : ""
  );
  const [textValue, setTextValue] = useState(localValue);
  const [datePickerValue, setDatePickerValue] = useState<Date | null>(null);

  const [parsedValue, dateTimeValue, isValid, invalidReason] = useMemo(() => {
    if (isNull(localValue)) return ["", null, true, null];

    const parsed = DateTime.fromISO(localValue).setZone(timezone);

    if (parsed.isValid) {
      return [parsed.toString(), parsed, true, null];
    }

    return [localValue, null, false, parsed.invalidReason];
  }, [localValue]);

  const isParsable = useMemo(
    () => (isEmpty(localValue) ? true : isValid),
    [isValid, localValue]
  );

  useEffect(() => {
    if (dateTimeValue && dateTimeValue.isValid) {
      setDatePickerValue(dateTimeValue.toJSDate());
    }
  }, [dateTimeValue]);

  useEffect(() => {
    if (textValue) {
      setLocalValue(DateTime.fromFormat(textValue, format).toISO());
    }
  }, [textValue]);

  const getDateValue = (
    date: Date | [Date | null, Date | null] | null
  ): Date | null => (isArray(date) ? date[0] : date);

  const handleOnChange = (date: Date | [Date | null, Date | null] | null) => {
    const value = getDateValue(date);
    // If we have a valid value set it to local.
    if (value?.toISOString()) setLocalValue(value?.toISOString());
  };

  useEffect(() => {
    if (localValue && setValue) {
      const parsedValue = DateTime.fromISO(localValue);

      let dbValue;
      // If it's only time we're updating, parse it to time format
      if (columnFieldOptions.showTime && !columnFieldOptions.showDate) {
        dbValue = parsedValue.toFormat(format);
      } else {
        dbValue = parsedValue;
      }

      setValue(name, dbValue, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });

      if (parsedValue && parsedValue.isValid) {
        setDatePickerValue(parsedValue.toJSDate());
      }

      setLocalValue(parsedValue.toISO());
      if (parsedValue.isValid) {
        setTextValue(parsedValue.toFormat(format));
      }
    }

    if (isFunction(register.onBlur)) {
      register.onBlur({
        type: "blur",
        target: {
          localValue,
        },
      });
    }
  }, [localValue]);

  return (
    <EditFieldWrapper field={field} schema={schema}>
      <FormControl
        isInvalid={hasError || !isParsable}
        isDisabled={columnBaseOptions?.readonly}
      >
        <div className="flex w-full">
          <InputGroup>
            <Input
              type="text"
              onChange={(e) => setTextValue(e.currentTarget.value)}
              value={textValue}
              placeholder={columnBaseOptions?.placeholder}
            />

            <InputRightAddon padding={0}>
              <DatePicker
                selected={datePickerValue}
                onChange={handleOnChange}
                showTimeSelect={columnFieldOptions.showTime}
                showTimeSelectOnly={!columnFieldOptions.showDate}
                timeIntervals={15}
                timeCaption="Time"
                customInput={<FacadeButton />}
                readOnly={columnBaseOptions?.readonly}
              />
            </InputRightAddon>
          </InputGroup>
        </div>

        {columnBaseOptions?.help && (
          <FormHelperText>{parse(columnBaseOptions.help || "")}</FormHelperText>
        )}
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

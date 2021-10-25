import { EditFieldProps } from "@/features/fields/types";
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  Textarea,
} from "@chakra-ui/react";
import { Views } from "@/features/fields/enums";
import { fieldId } from "@/features/fields";
import { isEmpty, isNull, isUndefined } from "lodash";
import EditFieldWrapper from "@/features/fields/components/FieldWrapper/EditFieldWrapper";
import React, { memo, useMemo, useState } from "react";

const Edit = ({
  field,
  formState,
  register: registerMethod,
  setValue,
  schema,
  view,
}: EditFieldProps) => {
  const register = registerMethod(field.column.name);
  const errors = useMemo(() => formState.errors, [formState]);
  const { name } = register;

  const [jsonError, setJsonError] = useState<string | null>(null);

  const hasError = useMemo(() => !isEmpty(errors[name]), [errors[name]]);
  const helpText = null;
  const hasHelp = !isNull(helpText);

  const placeholder = field.column.fieldOptions.placeholder;

  const defaultValue =
    field?.column?.baseOptions?.defaultValue && view === Views.new
      ? field.column.baseOptions.defaultValue
      : null;

  const readonly = field?.column?.baseOptions?.readonly
    ? field.column.baseOptions.readonly
    : false;

  let initialValue;
  try {
    initialValue =
      isUndefined(field.value) || isNull(field.value)
        ? isNull(defaultValue)
          ? null
          : JSON.stringify(JSON.parse(defaultValue as string), null, 2)
        : JSON.stringify(JSON.parse(field.value as string), null, 2);
  } catch (e) {
    initialValue = null;
  }

  const handleOnChange = (value: string) => {
    if (isEmpty(value)) {
      if (setValue) {
        setValue(
          register.name,
          {},
          {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          }
        );
      }
    } else {
      if (setValue) {
        let parsedValue;
        try {
          parsedValue = JSON.parse(value);
          setJsonError(null);
        } catch (e) {
          setJsonError("Error parsing the JSON!");
        }
        if (parsedValue) {
          setValue(register.name, parsedValue, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
        }
      }
    }
  };

  return (
    <EditFieldWrapper field={field} schema={schema}>
      <pre>{JSON.stringify(this, null, 2)}</pre>
      <FormControl
        isInvalid={hasError || !isNull(jsonError)}
        id={fieldId(field)}
        isDisabled={readonly}
      >
        <Textarea
          rows={10}
          placeholder={placeholder as string}
          id={fieldId(field)}
          defaultValue={initialValue as string}
          onChange={(e) => {
            handleOnChange(e.currentTarget.value);
          }}
        />
        {hasHelp && <FormHelperText>{helpText}</FormHelperText>}
        <FormErrorMessage>
          {errors[name]?.message || jsonError}
        </FormErrorMessage>
      </FormControl>
    </EditFieldWrapper>
  );
};

export default memo(Edit);

import { EditFieldProps } from "@/features/fields/types";
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  Textarea,
} from "@chakra-ui/react";
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
}: EditFieldProps) => {
  const register = registerMethod(field.column.name);
  const { errors } = formState;
  const { name } = register;

  const [jsonError, setJsonError] = useState<string | null>(null);

  const hasError = useMemo(() => !isEmpty(errors[name]), [errors[name]]);
  const helpText = null;
  const hasHelp = !isNull(helpText);

  const placeholder = field.column.fieldOptions.placeholder;


  let initialValue = '{}'
  try {
    initialValue = isUndefined(field.value) ? '{}' : JSON.stringify(JSON.parse(field.value as string), null, 2)
  } catch (e) {
    initialValue = '{}'
  }

  const handleOnChange = (value: string) => {
    if(isEmpty(value)) {
      if (setValue) {
        setValue(register.name, {}, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      }
    } else {
      if (setValue) {
        let parsedValue
        try {
          parsedValue = JSON.parse(value)
          setJsonError(null)
        } catch(e) {
          setJsonError("Error parsing the JSON!")
        }
        if(parsedValue) {
          setValue(register.name, parsedValue, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
        }
      }
    }
  }

  return (
    <EditFieldWrapper field={field} schema={schema}>
      <pre>
        {JSON.stringify(this, null, 2)}
      </pre>
      <FormControl isInvalid={(hasError && formState.isDirty) || !isNull(jsonError)} id={fieldId(field)}>
      <Textarea rows={10}
        placeholder={placeholder as string}
        id={fieldId(field)}
        defaultValue={initialValue}
        onChange={(e) =>  { handleOnChange(e.currentTarget.value) }}/>
        {hasHelp && <FormHelperText>{helpText}</FormHelperText>}
        <FormErrorMessage>{errors[name]?.message || jsonError}</FormErrorMessage>
      </FormControl>
    </EditFieldWrapper>
  );
};

export default memo(Edit);

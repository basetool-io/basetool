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
import React, { memo, useMemo } from "react";

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

  const hasError = useMemo(() => !isEmpty(errors[name]), [errors[name]]);
  const helpText = null;
  const hasHelp = !isNull(helpText);

  const placeholder = field.column.fieldOptions.placeholder;

  let initialValue = '{}'
  try {
    initialValue = isUndefined(field.value) ? '{}' : JSON.stringify(field.value as string)
  } catch (e) {
    initialValue = '{}'
  }

  return (
    <EditFieldWrapper field={field} schema={schema}>
      <FormControl isInvalid={hasError && formState.isDirty} id={fieldId(field)}>
      <Textarea rows={10} placeholder={placeholder as string} id={fieldId(field)} value={initialValue} onChange={(e) =>  {
        if (setValue) {
          setValue(register.name, JSON.parse(e.currentTarget.value), {
              shouldValidate: true,
              shouldDirty: true,
              shouldTouch: true,
            });
        }
        }} />
        {hasHelp && <FormHelperText>{helpText}</FormHelperText>}
        {hasError && (
          <FormErrorMessage>{errors[name]?.message}</FormErrorMessage>
        )}
      </FormControl>
    </EditFieldWrapper>
  );
};

export default memo(Edit);

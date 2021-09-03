import { EditFieldProps } from "@/features/fields/types";
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  Textarea,
} from "@chakra-ui/react";
import { fieldId } from "@/features/fields";
import { isEmpty, isNull } from "lodash";
import EditFieldWrapper from "@/features/fields/components/FieldWrapper/EditFieldWrapper";
import React, { memo, useMemo } from "react";

const Edit = ({
  field,
  formState,
  register: registerMethod,
  schema,
}: EditFieldProps) => {
  const register = registerMethod(field.column.name);
  const { errors } = formState;
  const { name } = register;

  // options
  const rows = field.column.fieldOptions.rows;
  const placeholder = field.column.fieldOptions.placeholder;

  const hasError = useMemo(() => !isEmpty(errors[name]), [errors[name]]);
  const helpText = null;
  const hasHelp = !isNull(helpText);

  return (
    <EditFieldWrapper field={field} schema={schema}>
      <FormControl isInvalid={hasError && formState.isDirty}>
        <Textarea rows={rows} placeholder={placeholder} id={fieldId(field)} {...register} />
        {hasHelp && <FormHelperText>{helpText}</FormHelperText>}
        {hasError && (
          <FormErrorMessage>{errors[name]?.message}</FormErrorMessage>
        )}
      </FormControl>
    </EditFieldWrapper>
  );
};

export default memo(Edit);

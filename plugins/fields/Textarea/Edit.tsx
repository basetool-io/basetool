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
import parse from 'html-react-parser';

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
  const readonly = field?.column?.baseOptions?.readonly ? field.column.baseOptions.readonly : false;

  const hasError = useMemo(() => !isEmpty(errors[name]), [errors[name]]);
  const helpText = field?.column?.baseOptions?.help ? field.column.baseOptions.help : null
  const hasHelp = !isNull(helpText);

  return (
    <EditFieldWrapper field={field} schema={schema}>
      <FormControl isInvalid={hasError && formState.isDirty} isDisabled={readonly}>
        <Textarea rows={rows} placeholder={placeholder} id={fieldId(field)} {...register} />
        {hasHelp && <FormHelperText>{parse(helpText || '')}</FormHelperText>}
        {hasError && (
          <FormErrorMessage>{errors[name]?.message}</FormErrorMessage>
        )}
      </FormControl>
    </EditFieldWrapper>
  );
};

export default memo(Edit);

import { Checkbox, FormControl, FormErrorMessage, FormHelperText } from "@chakra-ui/react";
import { EditFieldProps } from "@/features/fields/types";
import EditFieldWrapper from "@/features/fields/components/FieldWrapper/EditFieldWrapper";
import React, { memo, useMemo } from "react";
import isEmpty from "lodash/isEmpty";
import isNull from "lodash/isNull";
import parse from 'html-react-parser';

const Edit = ({
  field,
  formState,
  register: registerMethod,
}: EditFieldProps) => {
  const register = registerMethod(field.column.name);
  const { errors } = formState;
  const { name } = register;

  const hasError = useMemo(() => !isEmpty(errors[name]), [errors[name]]);
  const helpText = field?.column?.baseOptions?.help ? field.column.baseOptions.help : null
  const hasHelp = !isNull(helpText);

  const isChecked = useMemo(() => {
    field.value === true
  }, [field.value]);

  // options
  const readonly = field?.column?.baseOptions?.readonly ? field.column.baseOptions.readonly : false

  return (
    <EditFieldWrapper field={field}>
      <FormControl isInvalid={hasError && formState.isDirty}>
        <Checkbox isChecked={isChecked} {...register} isDisabled={readonly}/>
        {hasHelp && <FormHelperText>{parse(helpText || '')}</FormHelperText>}
        {hasError && (
          <FormErrorMessage>{errors[name]?.message}</FormErrorMessage>
        )}
      </FormControl>
    </EditFieldWrapper>
  );
};

export default memo(Edit);

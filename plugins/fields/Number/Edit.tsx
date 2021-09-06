import { EditFieldProps } from "@/features/fields/types";
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  Input,
} from "@chakra-ui/react";
import { isEmpty, isNull } from "lodash";
import EditFieldWrapper from "@/features/fields/components/FieldWrapper/EditFieldWrapper";
import React, { memo, useMemo } from "react";
import { fieldId } from "@/features/fields";
import parse from 'html-react-parser';

const Edit = ({
  field,
  formState,
  register: registerMethod,
  schema,
}: EditFieldProps) => {
  const register = registerMethod(field.column.name, {
    // React hook form casts empty values to 0 or NaN instead of null. We're overriding that here.
    setAsValue: (value: any) => {
      if (value) return value;

      return null;
    },
  });
  const { errors } = formState;
  const { name } = register;

  const hasError = useMemo(() => !isEmpty(errors[name]), [errors[name]]);
  const helpText = field?.column?.baseOptions?.help ? field.column.baseOptions.help : null
  const hasHelp = !isNull(helpText);

  // options
  const readonly = field?.column?.baseOptions?.readonly ? field.column.baseOptions.readonly : false

  return (
    <EditFieldWrapper field={field} schema={schema}>
      <FormControl isInvalid={hasError && formState.isDirty} isDisabled={readonly}>
        <Input type="number" id={fieldId(field)} {...register} />
        {hasHelp && <FormHelperText>{parse(helpText || '')}</FormHelperText>}
        {hasError && (
          <FormErrorMessage>{errors[name]?.message}</FormErrorMessage>
        )}
      </FormControl>
    </EditFieldWrapper>
  );
};

export default memo(Edit);

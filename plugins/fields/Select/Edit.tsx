import { EditFieldProps } from "@/features/fields/types";
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  Select,
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
  const optionsString = field.column.fieldOptions.options as string;
  const options = optionsString.split(',');
  options.forEach((option, index) => options[index] = option.trim());

  const hasError = useMemo(() => !isEmpty(errors[name]), [errors[name]]);
  const helpText = null;
  const hasHelp = !isNull(helpText);

  return (
    <EditFieldWrapper field={field} schema={schema}>
      <FormControl isInvalid={hasError && formState.isDirty}>
        <Select
          id={fieldId(field)} {...register}
          // placeholder={placeholder}
        >
          {/* {placeholder && <option disabled>{placeholder}</option> } */}
          {options &&
            options.map((option: string, index: number) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
        </Select>
        {hasHelp && <FormHelperText>{helpText}</FormHelperText>}
        {hasError && (
          <FormErrorMessage>{errors[name]?.message}</FormErrorMessage>
        )}
      </FormControl>
    </EditFieldWrapper>
  );
};

export default memo(Edit);

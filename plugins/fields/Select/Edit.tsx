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
import parse from "html-react-parser";

const Edit = ({
  field,
  formState,
  register: registerMethod,
  schema,
  view,
}: EditFieldProps) => {
  const register = registerMethod(field.column.name);
  const errors = useMemo(() => formState.errors, [formState]);
  const { name } = register;

  // options
  const optionsString = field.column.fieldOptions.options as string;
  const options = optionsString.split(",");
  options.forEach((option, index) => (options[index] = option.trim()));
  const placeholder = field?.column?.baseOptions?.placeholder
    ? field.column.baseOptions.placeholder
    : "";
  const readonly = field?.column?.baseOptions?.readonly
    ? field.column.baseOptions.readonly
    : false;

  const hasError = useMemo(() => !isEmpty(errors[name]), [errors[name]]);
  const helpText = field?.column?.baseOptions?.help
    ? field.column.baseOptions.help
    : null;
  const hasHelp = !isNull(helpText);
  const defaultValue =
    field?.column?.baseOptions?.defaultValue && view === "new"
      ? field.column.baseOptions.defaultValue
      : null;

  return (
    <EditFieldWrapper field={field} schema={schema}>
      <FormControl isInvalid={hasError} isDisabled={readonly}>
        <Select
          id={fieldId(field)}
          {...register}
          placeholder={placeholder}
          defaultValue={defaultValue}
          size="sm"
        >
          {options &&
            options.map((option: string, index: number) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
        </Select>
        {hasHelp && <FormHelperText>{parse(helpText || "")}</FormHelperText>}
        {hasError && (
          <FormErrorMessage>{errors[name]?.message}</FormErrorMessage>
        )}
      </FormControl>
    </EditFieldWrapper>
  );
};

export default memo(Edit);

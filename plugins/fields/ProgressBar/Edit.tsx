import { EditFieldProps } from "@/features/fields/types";
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  Input,
} from "@chakra-ui/react";
import { ProgressBarFieldOptions } from "./types";
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
  const helpText = field?.column?.baseOptions?.help
    ? field.column.baseOptions.help
    : null;
  const hasHelp = !isNull(helpText);

  // options
  const placeholder = field?.column?.baseOptions?.placeholder
    ? field.column.baseOptions.placeholder
    : "";
  const readonly = field?.column?.baseOptions?.readonly
    ? field.column.baseOptions.readonly
    : false;

  return (
    <EditFieldWrapper field={field} schema={schema}>
      <div className="text-center text-sm font-semibold w-full leading-none mb-1">
        <span className="js-progress-bar-value-<%= @field.id %>">
          {field.value}
          {(field.column.fieldOptions as ProgressBarFieldOptions).value_suffix}
        </span>
      </div>
      <FormControl
        isInvalid={hasError && formState.isDirty}
        isDisabled={readonly}
      >
        <Input
          type="range"
          id={fieldId(field)}
          min="0"
          max={(field.column.fieldOptions as ProgressBarFieldOptions).max}
          step={(field.column.fieldOptions as ProgressBarFieldOptions).step}
          class="w-full"
          {...register}
          placeholder={placeholder}
        />
        {hasHelp && <FormHelperText>{parse(helpText || "")}</FormHelperText>}
        {hasError && (
          <FormErrorMessage>{errors[name]?.message}</FormErrorMessage>
        )}
      </FormControl>
    </EditFieldWrapper>
  );
};

export default memo(Edit);

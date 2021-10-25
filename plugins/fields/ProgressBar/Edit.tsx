import { EditFieldProps } from "@/features/fields/types";
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
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

  const fieldOptions = field.column.fieldOptions as ProgressBarFieldOptions;

  return (
    <EditFieldWrapper field={field} schema={schema}>
      <div className="text-center text-sm font-semibold w-full leading-none mb-1">
        <span className={`js-progress-bar-value-${fieldId(field)}`}>
          {field.value}
          {fieldOptions.valueSuffix}
        </span>
      </div>
      <FormControl
        isInvalid={hasError && formState.isDirty}
        isDisabled={readonly}
      >
        <input
          type="range"
          id={fieldId(field)}
          min="0"
          max={fieldOptions.max}
          step={fieldOptions.step}
          className="w-full"
          {...register}
          placeholder={placeholder}
          disabled={readonly}
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

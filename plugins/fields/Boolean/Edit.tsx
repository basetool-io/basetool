import { Checkbox, FormErrorMessage, FormHelperText } from "@chakra-ui/react";
import { EditFieldProps } from "@/features/fields/types";
import EditFieldWrapper from "@/features/fields/components/FieldWrapper/EditFieldWrapper";
import React, { memo, useMemo } from "react";
import isEmpty from "lodash/isEmpty";
import isNull from "lodash/isNull";

const Edit = ({
  field,
  formState,
  register: registerMethod,
}: EditFieldProps) => {
  const register = registerMethod(field.column.name);
  const { errors } = formState;
  const { name } = register;

  const hasError = useMemo(() => !isEmpty(errors[name]), [errors[name]]);
  const helpText = null;
  const hasHelp = !isNull(helpText);

  const isChecked = useMemo(() => field.value === true, [field.value]);

  return (
    <EditFieldWrapper field={field}>
      <div className="h-8 flex items-center">
        <Checkbox isChecked={isChecked} {...register} />
        {hasHelp && <FormHelperText>{helpText}</FormHelperText>}
        {hasError && (
          <FormErrorMessage>{errors[name]?.message}</FormErrorMessage>
        )}
      </div>
    </EditFieldWrapper>
  );
};

export default memo(Edit);

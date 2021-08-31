import { EditFieldProps } from "@/features/fields/types";
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
} from "@chakra-ui/react";
import { fieldId } from "@/features/fields";
import { isEmpty, isNull } from "lodash";
import EditFieldWrapper from "@/features/fields/components/FieldWrapper/EditFieldWrapper";
import React, { memo, useMemo } from "react";
import dynamic from 'next/dynamic'

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

  const DynamicReactJson = dynamic(import('react-json-view'), { ssr: false });

  let initialValue
  try {
    initialValue = JSON.parse(field.value as string)
  } catch (e) {
    initialValue = {}
  }
  initialValue = isEmpty(field.value) ? {} : initialValue;
  const [jsonValue, setJsonValue] = React.useState(initialValue);

  const changeValue = (e: any) => {
    if (setValue) {
      setJsonValue(e.updated_src);

      setValue(register.name, JSON.stringify(e.updated_src), {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
    console.log(e);
  }

  return (
    <EditFieldWrapper field={field} schema={schema}>
      <FormControl isInvalid={hasError && formState.isDirty} id={fieldId(field)}>
        <DynamicReactJson
          src={jsonValue}
          // theme="monokai"
          name={false}
          collapsed={false}
          displayObjectSize={true}
          displayDataTypes={true}
          enableClipboard={false}
          onEdit={e => changeValue(e)}
          onDelete={e => changeValue(e)}
          onAdd={e => changeValue(e)}
        />
        {hasHelp && <FormHelperText>{helpText}</FormHelperText>}
        {hasError && (
          <FormErrorMessage>{errors[name]?.message}</FormErrorMessage>
        )}
      </FormControl>
    </EditFieldWrapper>
  );
};

export default memo(Edit);

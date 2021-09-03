import { EditFieldProps } from "@/features/fields/types";
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
} from "@chakra-ui/react";
import { fieldId } from "@/features/fields";
import { isEmpty, isNull, isUndefined } from "lodash";
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

  let initialValue
  try {
    initialValue = isUndefined(field.value) ? {} : JSON.parse(field.value as string)
  } catch (e) {
    initialValue = {}
  }

  const DynamicMonacoEditor = dynamic(import('react-monaco-editor'), { ssr: false });

  function onChange(newValue: string) {
    setValue(register.name, JSON.parse(newValue), {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
  }

  const options = {
    selectOnLineNumbers: true
  };


  return (
    <EditFieldWrapper field={field} schema={schema}>
      <FormControl isInvalid={hasError && formState.isDirty} id={fieldId(field)}>
        <DynamicMonacoEditor
          width="800"
          height="600"
          language="javascript"
          theme="vs-dark"
          value={JSON.stringify(initialValue, null, '\t')}
          options={options}
          onChange={onChange}
          // editorDidMount={::this.editorDidMount}
        />
        {/* <AceEditor
          name={'json-editor-'+fieldId(field)}
          placeholder={''}
          defaultValue={JSON.stringify(initialValue, null, '\t')}
          readOnly={false}
          onChange={onChange}
          editorProps={{ $blockScrolling: true }}
        /> */}
        {hasHelp && <FormHelperText>{helpText}</FormHelperText>}
        {hasError && (
          <FormErrorMessage>{errors[name]?.message}</FormErrorMessage>
        )}
      </FormControl>
    </EditFieldWrapper>
  );
};

export default memo(Edit);

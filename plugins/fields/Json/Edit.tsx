import {
  Code,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Textarea,
} from "@chakra-ui/react";
import { EditFieldProps } from "@/features/fields/types";
import { InteractionProps } from "react-json-view";
import { fieldId } from "@/features/fields";
import { isEmpty, isNull, isString } from "lodash";
import EditFieldWrapper from "@/features/fields/components/FieldWrapper/EditFieldWrapper";
import React, { memo, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

const DynamicReactJson = dynamic(() => import("react-json-view"), {
  ssr: false,
});

type JSONValues = Record<string, unknown> | [] | undefined | null;

const Edit = ({
  field,
  formState,
  register: registerMethod,
  setValue,
  schema,
  view,
}: EditFieldProps) => {
  const register = registerMethod(field.column.name);
  const errors = useMemo(() => formState.errors, [formState]);
  const { name } = register;

  const [jsonError, setJsonError] = useState<string | null>(null);
  const [localValue, setLocalValue] = useState<string>("");

  const hasError = useMemo(() => !isEmpty(errors[name]), [errors[name]]);
  const helpText = null;
  const hasHelp = !isNull(helpText);

  const placeholder = field.column.fieldOptions.placeholder;

  const defaultValue =
    field?.column?.baseOptions?.defaultValue && view === "new"
      ? field.column.baseOptions.defaultValue
      : null;

  const readonly = field?.column?.baseOptions?.readonly
    ? field.column.baseOptions.readonly
    : false;

  const value = useMemo(() => {
    try {
      if (isString(field.value)) {
        return JSON.parse(field.value as string);
      }
    } catch (e) {
      return null;
    }

    return field.value;
  }, [field.value]);

  const handleOnChange = (value: string) => {
    if (!isEmpty(value)) {
      let parsedValue;

      try {
        parsedValue = JSON.parse(value);
        setJsonError(null);
      } catch (e) {
        setJsonError("Error parsing the JSON contents!");
      }
      setAllValues(parsedValue);
    }
  };

  const setAllValues = (value: JSONValues) => {
    if (setValue) {
      setValue(register.name, value, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  };

  useEffect(() => {
    handleOnChange(localValue);
  }, [localValue]);

  useEffect(() => {
    setLocalValue(JSON.stringify(value, null, 2));
  }, []);

  return (
    <EditFieldWrapper field={field} schema={schema}>
      <FormControl
        isInvalid={hasError || !isNull(jsonError)}
        id={fieldId(field)}
        isDisabled={readonly}
      >
        <Tabs size="sm" variant="enclosed">
          <TabList>
            <Tab>Parsed</Tab>
            <Tab>Raw</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              {isNull(value) && <Code>null</Code>}
              {isNull(value) || (
                <DynamicReactJson
                  src={value as Record<string, unknown>}
                  name={false}
                  collapsed={false}
                  displayObjectSize={true}
                  displayDataTypes={true}
                  enableClipboard={false}
                  onEdit={(edit: InteractionProps) => {
                    handleOnChange(JSON.stringify(edit.updated_src));
                    setLocalValue(JSON.stringify(edit.updated_src, null, 2));
                  }}
                  onAdd={(edit: InteractionProps) => {
                    handleOnChange(JSON.stringify(edit.updated_src));
                    setLocalValue(JSON.stringify(edit.updated_src, null, 2));
                  }}
                />
              )}
            </TabPanel>
            <TabPanel>
              <Textarea
                className="font-mono"
                rows={10}
                placeholder={placeholder as string}
                id={fieldId(field)}
                value={localValue}
                onChange={(e) => {
                  setLocalValue(e.currentTarget.value);
                }}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
        {hasHelp && <FormHelperText>{helpText}</FormHelperText>}
        <FormErrorMessage>
          {errors[name]?.message || jsonError}
        </FormErrorMessage>
      </FormControl>
    </EditFieldWrapper>
  );
};

export default memo(Edit);

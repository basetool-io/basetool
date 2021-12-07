import { EditFieldProps } from "@/features/fields/types";
import {
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
import { InteractionProps } from "react-json-view"
import { fieldId } from "@/features/fields";
import { isEmpty, isNull, isString, isUndefined } from "lodash";
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

  let value = useMemo(
    () =>
      isUndefined(field.value) || isNull(field.value)
        ? defaultValue
        : field.value,
    [field.value]
  );

  try {
    if (isString(value)) {
      value = JSON.parse(value as string);
    }
  } catch (e) {
    value = null;
  }

  const handleOnChange = (value: string) => {
    if (isEmpty(value)) {
      if (setValue) {
        setAllValues({});
      }
    } else {
      let parsedValue;
      try {
        parsedValue = JSON.parse(value);
        setJsonError(null);
      } catch (e) {
        setJsonError("Error parsing the JSON!");
      }
      if (parsedValue) {
        setAllValues(parsedValue);
      }
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
    setLocalValue(JSON.stringify(value, null, 2));
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
              <DynamicReactJson
                src={value as Record<string, unknown>}
                name={false}
                collapsed={false}
                displayObjectSize={true}
                displayDataTypes={true}
                enableClipboard={false}
                onEdit={(edit: InteractionProps) =>
                  handleOnChange(JSON.stringify(edit.updated_src))
                }
                onAdd={(edit: InteractionProps) =>
                  handleOnChange(JSON.stringify(edit.updated_src))
                }
              />
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

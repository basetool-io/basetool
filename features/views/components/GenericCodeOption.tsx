import { FormHelperText } from "@chakra-ui/react";
import { debounce, isString, snakeCase } from "lodash";
import { javascript } from "@codemirror/lang-javascript";
import { sql } from "@codemirror/lang-sql";
import { useSegment } from "@/hooks";
import { useUpdateColumn } from "../hooks";
import CodeMirror from "@uiw/react-codemirror";
import OptionWrapper from "@/features/views/components/OptionWrapper";
import React, { ReactNode, useCallback, useEffect, useState } from "react";

type Props = {
  helpText: string | ReactNode;
  id?: string;
  label: string;
  placeholder?: string;
  formHelperText?: string | ReactNode;
  defaultValue?: string;
  optionKey: string;
  lang?: "javascript" | "sql";
};

const GenericTextOption = ({
  helpText,
  id,
  label,
  placeholder,
  formHelperText,
  defaultValue,
  optionKey,
  lang = "javascript",
}: Props) => {
  id ||= snakeCase(label.toLowerCase());
  const track = useSegment();

  const { column, setColumnOptions } = useUpdateColumn();
  const [value, setValue] = useState<string>();

  const debouncedSetColumnOptions = useCallback(
    debounce(setColumnOptions, 1000),
    []
  );

  const handleOnChange = (value: string) => {
    setValue(value);
    if (column) {
      track("Updated column option.", {
        id,
        type: "text",
      });

      debouncedSetColumnOptions(column.name, {
        [optionKey]: value,
      });
    }
  };

  useEffect(() => {
    if (isString(defaultValue)) setValue(defaultValue);
  }, [defaultValue]);

  if (!column) return null;

  const extensions = [];

  switch (lang) {
    default:
    case "javascript":
      extensions.push(javascript());
      break;
    case "sql":
      extensions.push(sql());
      break;
  }

  return (
    <OptionWrapper helpText={helpText} id={id} label={label}>
      <CodeMirror
        value={value}
        extensions={extensions}
        onChange={handleOnChange}
        placeholder={placeholder}
      />
      {formHelperText && <FormHelperText>{formHelperText}</FormHelperText>}
    </OptionWrapper>
  );
};

export default GenericTextOption;

import { FormHelperText } from "@chakra-ui/react";
import { debounce, isString } from "lodash";
import { javascript } from "@codemirror/lang-javascript";
import { sql } from "@codemirror/lang-sql";
import { useSegment } from "@/hooks";
import { useUpdateWidget } from "../hooks";
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

const GenericCodeOption = ({
  helpText,
  id,
  label,
  placeholder,
  formHelperText,
  defaultValue,
  optionKey,
  lang = "javascript",
}: Props) => {
  const track = useSegment();

  const { widget, setWidgetOptions } = useUpdateWidget();
  const [value, setValue] = useState<string>();

  const debouncedSetWidgetOptions = useCallback(
    debounce(setWidgetOptions, 1000),
    []
  );

  const handleOnChange = (value: string) => {
    setValue(value);
    if (widget) {
      track("Updated widget.", {
        id: widget.id,
      });

      debouncedSetWidgetOptions(widget.id, {
        [optionKey]: value,
      });
    }
  };

  useEffect(() => {
    if (isString(defaultValue)) setValue(defaultValue);
  }, [defaultValue]);

  if (!widget) return null;

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

export default GenericCodeOption;

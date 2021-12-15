import {
  Checkbox,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Select,
} from "@chakra-ui/react";
import { Code } from "@chakra-ui/layout";
import { InspectorProps } from "@/features/fields/types";
import { debounce, isString } from "lodash";
import OptionWrapper from "@/features/views/components/OptionWrapper";
import React, { useCallback, useEffect, useState } from "react";

type DisplayAsOptions = "link" | "image" | "email" | "text";

function Inspector({ column, setColumnOptions }: InspectorProps) {
  const setDisplayAs = (value: DisplayAsOptions) => {
    setColumnOptions(column.name, {
      "fieldOptions.displayAs": value,
    });
  };

  const debouncedSetColumnOptions = useCallback(
    debounce(setColumnOptions, 1000),
    []
  );

  const [linkText, setLinkText] = useState<string>();
  const [linkPrefix, setLinkPrefix] = useState<string>();

  const updateLinkText = (event: any) => {
    setLinkText(event.currentTarget.value);
    if (column)
      debouncedSetColumnOptions(column.name, {
        "fieldOptions.linkText": event.currentTarget.value,
      });
  };

  const updateLinkPrefix = (event: any) => {
    setLinkPrefix(event.currentTarget.value);
    if (column)
      debouncedSetColumnOptions(column.name, {
        "fieldOptions.linkPrefix": event.currentTarget.value,
      });
  };

  useEffect(() => {
    if (isString(column?.fieldOptions?.linkText))
      setLinkText(column.fieldOptions.linkText);
  }, [column]);

  return (
    <>
      <OptionWrapper
        helpText="When you need a field to be displayed in a different way."
        label="Display as"
        id="displayAs"
      >
        <Select
          onChange={(e) =>
            setDisplayAs(e.currentTarget.value as DisplayAsOptions)
          }
          value={(column.fieldOptions.displayAs as DisplayAsOptions) || "text"}
          size="sm"
        >
          <option value="text">Regular text</option>
          <option value="link">Link</option>
          <option value="image">Image</option>
          <option value="email">Email</option>
        </Select>
        <div className="flex flex-col space-y-2"></div>

        <FormHelperText>
          Default is <Code>text</Code> but you can change it to{" "}
          <Code>link</Code>, <Code>email</Code> or <Code>image</Code>.
        </FormHelperText>

        {column.fieldOptions.displayAs === "link" && (
          <div>
            <FormControl id="openNewTab" className="mt-2">
              <Checkbox
                isChecked={column.fieldOptions.openNewTab === true}
                onChange={() =>
                  setColumnOptions(column.name, {
                    "fieldOptions.openNewTab": !column.fieldOptions.openNewTab,
                  })
                }
              >
                <span className="text-sm font-semibold text-neutral-600 flex">Open new Tab</span>
              </Checkbox>
            </FormControl>
            <FormControl id="linkText" className="mt-2">
              <label className="text-sm font-semibold text-neutral-600 flex">Link text</label>
              <Input
                type="text"
                name="linkText"
                placeholder="Link text"
                required={false}
                value={linkText}
                onChange={updateLinkText}
                size="sm"
              />
            </FormControl>
            <FormControl id="linkPrefix" className="mt-2">
              <label className="text-sm font-semibold text-neutral-600 flex">Link prefix</label>
              <Input
                type="text"
                name="linkPrefix"
                placeholder="Link text"
                required={false}
                value={linkPrefix}
                onChange={updateLinkPrefix}
                size="sm"
              />
            </FormControl>
          </div>
        )}
      </OptionWrapper>
    </>
  );
}

export default Inspector;

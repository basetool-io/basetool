import {
  Checkbox,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  Radio,
  RadioGroup,
} from "@chakra-ui/react";
import { Code } from "@chakra-ui/layout";
import { Column } from "@/features/fields/types";
import OptionWrapper from "@/features/tables/components/OptionsWrapper";
import React, { useEffect } from "react";

function Inspector({
  column,
  setColumnOptions,
}: {
  column: Column;
  setColumnOptions: (c: Column, options: Record<string, unknown>) => void;
}) {
  let initiaiDisplayAs;
  if (column.fieldOptions.displayAsLink === true) {
    initiaiDisplayAs = "link";
  } else if (column.fieldOptions.displayAsImage === true) {
    initiaiDisplayAs = "image";
  } else if (column.fieldOptions.displayAsEmail === true) {
    initiaiDisplayAs = "email";
  } else {
    initiaiDisplayAs = "text";
  }

  const [displayAs, setDisplayAs] = React.useState(initiaiDisplayAs);

  useEffect(() => {
    switch (displayAs) {
      case "link":
        setColumnOptions(column, {
          "fieldOptions.displayAsLink": true,
          "fieldOptions.displayAsImage": false,
          "fieldOptions.displayAsEmail": false,
        });
        break;
      case "image":
        setColumnOptions(column, {
          "fieldOptions.displayAsLink": false,
          "fieldOptions.displayAsImage": true,
          "fieldOptions.displayAsEmail": false,
        });
        break;
      case "email":
        setColumnOptions(column, {
          "fieldOptions.displayAsLink": false,
          "fieldOptions.displayAsImage": false,
          "fieldOptions.displayAsEmail": true,
        });
        break;
      default:
        setColumnOptions(column, {
          "fieldOptions.displayAsLink": false,
          "fieldOptions.displayAsImage": false,
          "fieldOptions.displayAsEmail": false,
        });
        break;
    }
  }, [displayAs]);

  return (
    <>
      <OptionWrapper helpText="When you need a field to be displayed in a different way.">
        <FormControl as="fieldset">
          <FormLabel as="legend">Display as</FormLabel>
          <RadioGroup
            defaultValue="text"
            onChange={setDisplayAs}
            value={displayAs}
          >
            <HStack spacing="20px">
              <Radio value="text">Text</Radio>
              <Radio value="link">Link</Radio>
              <Radio value="image">Image</Radio>
              <Radio value="email">Email</Radio>
            </HStack>
          </RadioGroup>
          <FormHelperText>Default is <Code>text</Code></FormHelperText>
        </FormControl>
        {column.fieldOptions.displayAsLink === true && (
          <>
            <FormControl id="openNewTab" className="mt-2">
              <FormLabel>Open new tab</FormLabel>
              <Checkbox
                isChecked={column.fieldOptions.openNewTab === true}
                onChange={() =>
                  setColumnOptions(column, {
                    "fieldOptions.openNewTab": !column.fieldOptions.openNewTab,
                  })
                }
              >
                Open new Tab
              </Checkbox>
            </FormControl>
            <FormControl id="linkText" className="mt-2">
              <FormLabel>Link Text</FormLabel>
              <Input
                type="text"
                name="linkText"
                placeholder="Link text"
                required={false}
                value={column.fieldOptions.linkText as string}
                onChange={(e) => {
                  setColumnOptions(column, {
                    "fieldOptions.linkText": e.currentTarget.value,
                  });
                }}
              />
            </FormControl>
          </>
        )}
      </OptionWrapper>
    </>
  );
}

export default Inspector;

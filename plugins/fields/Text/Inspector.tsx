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
import { Column } from "@/features/fields/types";
import OptionWrapper from "@/features/tables/components/OptionsWrapper";
import React, { useEffect } from "react";

function Inspector({
  column,
  setColumnOptions,
}: {
  column: Column;
  setColumnOptions: (
    c: Column,
    options: { name: string; value: any }[]
  ) => void;
}) {
  let initiaiDisplayAs;
  if (column.fieldOptions.displayAsLink === true) initiaiDisplayAs = "link";
  else if (column.fieldOptions.displayAsImage === true)
    initiaiDisplayAs = "image";
  else if (column.fieldOptions.displayAsEmail === true)
    initiaiDisplayAs = "email";
  else initiaiDisplayAs = "text";
  const [displayAs, setDisplayAs] = React.useState(initiaiDisplayAs);

  useEffect(() => {
    switch (displayAs) {
      case "link":
        setColumnOptions(column, [
          { name: "fieldOptions.displayAsLink", value: true },
          { name: "fieldOptions.displayAsImage", value: false },
          { name: "fieldOptions.displayAsEmail", value: false },
        ]);
        break;
      case "image":
        setColumnOptions(column, [
          { name: "fieldOptions.displayAsLink", value: false },
          { name: "fieldOptions.displayAsImage", value: true },
          { name: "fieldOptions.displayAsEmail", value: false },
        ]);
        break;
      case "email":
        setColumnOptions(column, [
          { name: "fieldOptions.displayAsLink", value: false },
          { name: "fieldOptions.displayAsImage", value: false },
          { name: "fieldOptions.displayAsEmail", value: true },
        ]);
        break;
      default:
        setColumnOptions(column, [
          { name: "fieldOptions.displayAsLink", value: false },
          { name: "fieldOptions.displayAsImage", value: false },
          { name: "fieldOptions.displayAsEmail", value: false },
        ]);
        break;
    }
  }, [displayAs]);

  return (
    <>
      <OptionWrapper helpText="You can set how the text will be displayed.">
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
          <FormHelperText>By default is set to text.</FormHelperText>
        </FormControl>
        {column.fieldOptions.displayAsLink === true && (
          <>
            <FormControl id="openNewTab">
              <FormLabel>Open new tab</FormLabel>
              <Checkbox
                isChecked={column.fieldOptions.openNewTab === true}
                onChange={() =>
                  setColumnOptions(column, [
                    {
                      name: "fieldOptions.openNewTab",
                      value: !column.fieldOptions.openNewTab,
                    },
                  ])
                }
              >
                Open new Tab
              </Checkbox>
            </FormControl>
            <FormControl id="linkText">
              <FormLabel>Link Text</FormLabel>
              <Input
                type="text"
                name="linkText"
                placeholder="Link text"
                required={false}
                value={column.fieldOptions.linkText as string}
                onChange={(e) => {
                  setColumnOptions(column, [
                    {
                      name: "fieldOptions.linkText",
                      value: e.currentTarget.value,
                    },
                  ]);
                }}
              />
            </FormControl>
          </>
        )}
        {column.fieldOptions.displayAsEmail === true && (
          <FormControl id="emailPattern">
            <FormLabel>Email Pattern</FormLabel>
            <Input
              type="text"
              id="emailPattern"
              name="emailPattern"
              placeholder=".+@gmail\.com"
              required={false}
              value={column.fieldOptions.emailPattern as string}
              onChange={(e) => {
                setColumnOptions(column, [
                  {
                    name: "fieldOptions.emailPattern",
                    value: e.currentTarget.value,
                  },
                ]);
              }}
            />
          </FormControl>
        )}
      </OptionWrapper>
    </>
  );
}

export default Inspector;

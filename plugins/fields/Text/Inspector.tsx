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
  setColumnOption,
}: {
  column: Column;
  setColumnOption: (c: Column, name: string, value: any) => void;
}) {
  let initiaiDisplayAs;
  if (column.fieldOptions.displayAsLink === true) initiaiDisplayAs = "link";
  else if (column.fieldOptions.displayAsImage === true)
    initiaiDisplayAs = "image";
  else if (column.fieldOptions.displayAsEmail === true)
    initiaiDisplayAs = "email";
  else initiaiDisplayAs = "text";
  const [displayAs, setDisplayAs] = React.useState(initiaiDisplayAs);

  // useEffect(() => {
  //   if (column.fieldOptions.displayAsLink === true) {
  //     setColumnOption(column, "fieldOptions.displayAsImage", false);
  //     setColumnOption(column, "fieldOptions.displayAsEmail", false);
  //   }
  // }, [column.fieldOptions.displayAsLink]);

  // useEffect(() => {
  //   if (column.fieldOptions.displayAsImage === true) {
  //     setColumnOption(column, "fieldOptions.displayAsLink", false);
  //     setColumnOption(column, "fieldOptions.displayAsEmail", false);
  //   }
  // }, [column.fieldOptions.displayAsImage]);

  // useEffect(() => {
  //   if (column.fieldOptions.displayAsEmail === true) {
  //     setColumnOption(column, "fieldOptions.displayAsLink", false);
  //     setColumnOption(column, "fieldOptions.displayAsImage", false);
  //   }
  // }, [column.fieldOptions.displayAsEmail]);

  useEffect(() => {
    switch (displayAs) {
      case "link":
        console.log("link->");
        setColumnOption(column, "fieldOptions.displayAsLink", true);
        setColumnOption(column, "fieldOptions.displayAsImage", false);
        setColumnOption(column, "fieldOptions.displayAsEmail", false);
        break;
      case "image":
        console.log("img->");
        setColumnOption(column, "fieldOptions.displayAsImage", true);
        setColumnOption(column, "fieldOptions.displayAsLink", false);
        setColumnOption(column, "fieldOptions.displayAsEmail", false);
        break;
      case "email":
        console.log("email->");
        setColumnOption(column, "fieldOptions.displayAsEmail", true);
        setColumnOption(column, "fieldOptions.displayAsImage", false);
        setColumnOption(column, "fieldOptions.displayAsLink", false);
        break;
      default:
        console.log("def->");
        setColumnOption(column, "fieldOptions.displayAsEmail", false);
        setColumnOption(column, "fieldOptions.displayAsImage", false);
        setColumnOption(column, "fieldOptions.displayAsLink", false);
        break;
    }
  }, [displayAs]);

  return (
    <>
      {/* <OptionWrapper helpText="You may want to display the text as a link.">
        <FormControl id="displayAsLink">
          <FormLabel>Display as link</FormLabel>
          <Checkbox
            isChecked={column.fieldOptions.displayAsLink === true}
            onChange={() =>
              setColumnOption(
                column,
                "fieldOptions.displayAsLink",
                !column.fieldOptions.displayAsLink
              )
            }
          >
            Display as link
          </Checkbox>
        </FormControl>
        {column.fieldOptions.displayAsLink === true && (
          <Stack pl={6} mt={1} spacing={1}>
            <Checkbox
              id="openNewTab"
              isChecked={column.fieldOptions.openNewTab === true}
              onChange={() =>
                setColumnOption(
                  column,
                  "fieldOptions.openNewTab",
                  !column.fieldOptions.openNewTab
                )
              }
            >
              Open new Tab
            </Checkbox>
            <FormControl id="linkText">
              <FormLabel>Link Text</FormLabel>
              <Input
                type="text"
                name="linkText"
                placeholder="Link text"
                required={false}
                value={column.fieldOptions.linkText as string}
                onChange={(e) => {
                  setColumnOption(
                    column,
                    "fieldOptions.linkText",
                    e.currentTarget.value
                  );
                }}
              />
            </FormControl>
          </Stack>
        )}
      </OptionWrapper>

      <OptionWrapper helpText="You may want to display an image from an external source.">
        <FormControl id="displayAsImage">
          <FormLabel>Display as Image</FormLabel>
          <Checkbox
            isChecked={column.fieldOptions.displayAsImage === true}
            onChange={() =>
              setColumnOption(
                column,
                "fieldOptions.displayAsImage",
                !column.fieldOptions.displayAsImage
              )
            }
          >
            Display as image
          </Checkbox>
        </FormControl>
      </OptionWrapper>

      <OptionWrapper helpText="You may want to format as email.">
        <FormControl id="displayAsEmail">
          <FormLabel>Display as Email</FormLabel>
          <Checkbox
            isChecked={column.fieldOptions.displayAsEmail === true}
            onChange={() =>
              setColumnOption(
                column,
                "fieldOptions.displayAsEmail",
                !column.fieldOptions.displayAsEmail
              )
            }
          >
            Display as Email
          </Checkbox>
        </FormControl>
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
                setColumnOption(
                  column,
                  "fieldOptions.emailPattern",
                  e.currentTarget.value
                );
              }}
            />
          </FormControl>
        )}
      </OptionWrapper> */}

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
                  setColumnOption(
                    column,
                    "fieldOptions.openNewTab",
                    !column.fieldOptions.openNewTab
                  )
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
                  setColumnOption(
                    column,
                    "fieldOptions.linkText",
                    e.currentTarget.value
                  );
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
                setColumnOption(
                  column,
                  "fieldOptions.emailPattern",
                  e.currentTarget.value
                );
              }}
            />
          </FormControl>
        )}
      </OptionWrapper>
      <pre>{JSON.stringify(column, null, 2)}</pre>
    </>
  );
}

export default Inspector;

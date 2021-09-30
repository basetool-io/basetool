import { Code } from "@chakra-ui/layout";
import { ExternalLinkIcon } from "@heroicons/react/outline";
import { Field } from "@/features/fields/types";
import { Image, Link } from "@chakra-ui/react";
import { isEmpty } from "lodash";
import { isNull } from "lodash";
import React, { memo } from "react";
import ShowFieldWrapper from "@/features/fields/components/FieldWrapper/ShowFieldWrapper";

const Show = ({ field }: { field: Field }) => {
  if (isNull(field.value))
    return (
      <ShowFieldWrapper field={field}>
        <Code>null</Code>
      </ShowFieldWrapper>
    );

  if (field.column.fieldOptions.displayAsLink === true)
    return (
      <ShowFieldWrapper field={field}>
        <Link href={field.value as string}>
          <a
            className="text-blue-600"
            target={
              (field.column.fieldOptions.openNewTab as boolean) ? "_blank" : ""
            }
          >
            {!isEmpty(field.column.fieldOptions.linkText) &&
              field.column.fieldOptions.linkText}
            {!isEmpty(field.column.fieldOptions.linkText) || field.value}
            {field.column.fieldOptions.openNewTab === true && (
              <ExternalLinkIcon className="h-3 w-3 ml-1 inline-block" />
            )}
          </a>
        </Link>
      </ShowFieldWrapper>
    );

  if (field.column.fieldOptions.displayAsImage === true)
    return (
      <ShowFieldWrapper field={field}>
        <Image
          height="150px"
          src={field.value as string}
          alt={field.value as string}
          fallbackSrc="https://via.placeholder.com/150"
        />
      </ShowFieldWrapper>
    );

  if (field.column.fieldOptions.displayAsEmail === true)
    return (
      <ShowFieldWrapper field={field}>
        <Link href={("mailto: " + field.value) as string}>
          <a className="text-blue-600">{field.value}</a>
        </Link>
      </ShowFieldWrapper>
    );

  return <ShowFieldWrapper field={field}>{field.value}</ShowFieldWrapper>;
};

export default memo(Show);

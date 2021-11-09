import { Code } from "@chakra-ui/layout";
import { ExternalLinkIcon } from "@heroicons/react/outline";
import { Field } from "@/features/fields/types";
import { Image } from "@chakra-ui/react";
import { isEmpty, isNull } from "lodash";
import IndexFieldWrapper from "@/features/fields/components/FieldWrapper/IndexFieldWrapper";
import Link from "next/link";
import React, { memo } from "react";

const Index = ({ field }: { field: Field }) => {
  if (isNull(field.value))
    return (
      <IndexFieldWrapper field={field}>
        <Code>null</Code>
      </IndexFieldWrapper>
    );

  if (field.column.fieldOptions.displayAs === "link")
    return (
      <IndexFieldWrapper field={field}>
        <Link href={field.value as string}>
          <a
            className="text-blue-600"
            target={
              (field.column.fieldOptions.openNewTab as boolean) ? "_blank" : ""
            }
          >
            {isEmpty(field.column.fieldOptions.linkText) && field.value}
            {isEmpty(field.column.fieldOptions.linkText) ||
              field.column.fieldOptions.linkText}

            {field.column.fieldOptions.openNewTab === true && (
              <ExternalLinkIcon className="h-3 w-3 ml-1 inline-block" />
            )}
          </a>
        </Link>
      </IndexFieldWrapper>
    );

  if (field.column.fieldOptions.displayAs === "image")
    return (
      <IndexFieldWrapper field={field} flush={true}>
        <Image
          height="33px"
          src={field.value as string}
          alt={field.value as string}
          fallbackSrc="https://via.placeholder.com/33"
        />
      </IndexFieldWrapper>
    );

  if (field.column.fieldOptions.displayAs === "email")
    return (
      <IndexFieldWrapper field={field}>
        <Link href={("mailto: " + field.value) as string}>
          <a className="text-blue-600">{field.value}</a>
        </Link>
      </IndexFieldWrapper>
    );

  return <IndexFieldWrapper field={field}>{field.value}</IndexFieldWrapper>;
};

export default memo(Index);

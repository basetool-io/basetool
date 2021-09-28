import { ExternalLinkIcon } from "@heroicons/react/outline";
import { Field } from "@/features/fields/types";
import { Image, Link } from "@chakra-ui/react";
import { isEmpty } from "lodash";
import IndexFieldWrapper from "@/features/fields/components/FieldWrapper/IndexFieldWrapper";
import React, { memo } from "react";

const Index = ({ field }: { field: Field }) => (
  <IndexFieldWrapper field={field} noPadding={field.column.fieldOptions.displayAsImage as boolean}>
    {field.column.fieldOptions.displayAsLink === true &&
      <Link color="#2563eb" href={field.value as string} isExternal={field.column.fieldOptions.openNewTab as boolean}>
        {!isEmpty(field.column.fieldOptions.linkText) && field.column.fieldOptions.linkText}
        {!isEmpty(field.column.fieldOptions.linkText) || field.value}
        {field.column.fieldOptions.openNewTab === true && <ExternalLinkIcon className="h-3 w-3 ml-1 inline-block" />}
      </Link>
    }
    {field.column.fieldOptions.displayAsImage === true &&
      <Image
        boxSize="33px"
        src={field.value as string}
        alt={field.value as string}
        // fallbackSrc="https://via.placeholder.com/33"
      />
    }
    {field.column.fieldOptions.displayAsEmail === true &&
      <Link color="#2563eb" href={"mailto: " + field.value as string}>
        {field.value}
      </Link>
    }
    {(field.column.fieldOptions.displayAsLink === false && field.column.fieldOptions.displayAsImage === false && field.column.fieldOptions.displayAsEmail === false) &&
      field.value
    }
  </IndexFieldWrapper>
);

export default memo(Index);

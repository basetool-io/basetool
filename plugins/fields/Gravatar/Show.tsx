import { Code } from "@chakra-ui/layout";
import { Field } from "@/features/fields/types";
import { isNull } from "lodash";
import React, { memo } from "react";
import ShowFieldWrapper from "@/features/fields/components/FieldWrapper/ShowFieldWrapper";
import Image from "next/image";

const Show = ({ field }: { field: Field }) => {
  const value = isNull(field.value) ? <Code>null</Code> : field.value;
  const md5 = require("md5");
  const src = `https://www.gravatar.com/avatar/${md5(value as string)}?s=${
    field.column.fieldOptions.showWidth as number
  }`;
  const width = field.column.fieldOptions?.showWidth || 340;
  const height = field.column.fieldOptions?.showHeight || 340;

  return (
    <ShowFieldWrapper field={field}>
      <Image
        src={src}
        width={width as number}
        height={height as number}
        alt={value as string}
        title={value as string}
      />
    </ShowFieldWrapper>
  );
};

export default memo(Show);

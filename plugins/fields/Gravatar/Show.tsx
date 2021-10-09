import { Code } from "@chakra-ui/layout";
import { Field } from "@/features/fields/types";
import { SelectFieldOptions } from "./types";
import { isNull } from "lodash";
import Image from "next/image";
import React, { memo } from "react";
import ShowFieldWrapper from "@/features/fields/components/FieldWrapper/ShowFieldWrapper";
import md5 from "md5";

const Show = ({ field }: { field: Field }) => {
  const value = isNull(field.value) ? <Code>null</Code> : field.value;
  const dimensions = (field.column.fieldOptions as SelectFieldOptions)?.showDimensions || 340;

  const src = `https://www.gravatar.com/avatar/${md5(value as string)}?s=${dimensions}`;

  return (
    <ShowFieldWrapper field={field}>
      <Image
        src={src}
        width={dimensions}
        height={dimensions}
        alt={value as string}
        title={value as string}
      />
    </ShowFieldWrapper>
  );
};

export default memo(Show);

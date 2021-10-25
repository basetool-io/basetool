import { Code } from "@chakra-ui/layout";
import { Field } from "@/features/fields/types";
import { GravatarFieldOptions } from "./types";
import { isNull } from "lodash";
import Image from "next/image";
import React, { memo } from "react";
import ShowFieldWrapper from "@/features/fields/components/FieldWrapper/ShowFieldWrapper";
import md5 from "md5";

const Show = ({ field }: { field: Field }) => {
  const value = field.value ? field.value.toString() : "";
  const dimensions =
    (field.column.fieldOptions as GravatarFieldOptions)?.showDimensions || 340;

  const src = `https://www.gravatar.com/avatar/${md5(value)}?s=${dimensions}`;

  return (
    <ShowFieldWrapper field={field}>
      {isNull(field.value) && <Code>null</Code>}
      {isNull(field.value) || (
        <Image
          src={src}
          width={dimensions}
          height={dimensions}
          alt={value}
          title={value}
        />
      )}
    </ShowFieldWrapper>
  );
};

export default memo(Show);

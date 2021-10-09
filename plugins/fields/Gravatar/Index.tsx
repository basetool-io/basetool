import { Code } from "@chakra-ui/layout";
import { Field } from "@/features/fields/types";
import { SelectFieldOptions } from "./types";
import { isNull } from "lodash";
import Image from "next/image";
import IndexFieldWrapper from "@/features/fields/components/FieldWrapper/IndexFieldWrapper";
import React, { memo } from "react";
import md5 from "md5";

const Index = ({ field }: { field: Field }) => {
  const value = isNull(field.value) ? <Code>null</Code> : field.value;
  const src = `https://www.gravatar.com/avatar/${md5(value as string)}`;
  const indexDimensions =
    (field.column.fieldOptions as SelectFieldOptions)?.indexDimensions || 40;

  return (
    <IndexFieldWrapper field={field} flush={true}>
      <Image
        src={src}
        width={indexDimensions}
        height={indexDimensions}
        alt={value as string}
        title={value as string}
        priority
      />
    </IndexFieldWrapper>
  );
};

export default memo(Index);

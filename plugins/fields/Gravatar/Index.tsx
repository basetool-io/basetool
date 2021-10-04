import { Code } from "@chakra-ui/layout";
import { Field } from "@/features/fields/types";
import { isNull } from "lodash";
import IndexFieldWrapper from "@/features/fields/components/FieldWrapper/IndexFieldWrapper";
import React, { memo } from "react";
import Image from "next/image";

const Index = ({ field }: { field: Field }) => {
  const value = isNull(field.value) ? <Code>null</Code> : field.value;
  const md5 = require('md5');


  return <IndexFieldWrapper field={field}>
        <Image
          src={`https://www.gravatar.com/avatar/${md5(value as string)}`}
          width={field.column.fieldOptions.indexWidth as number}
          height={field.column.fieldOptions.indexHeight as number}
          alt={value as string}
          title={value as string}
          priority
        />
    </IndexFieldWrapper>;
};

export default memo(Index);

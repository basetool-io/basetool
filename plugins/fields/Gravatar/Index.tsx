import { Code } from "@chakra-ui/layout";
import { Field } from "@/features/fields/types";
import { isNull } from "lodash";
import IndexFieldWrapper from "@/features/fields/components/FieldWrapper/IndexFieldWrapper";
import React, { memo } from "react";
import Image from "next/image";
import { Md5 } from "ts-md5";

const Index = ({ field }: { field: Field }) => {
  const value = isNull(field.value) ? <Code>null</Code> : field.value;

  return <IndexFieldWrapper field={field}>
        <Image
          src={`https://www.gravatar.com/avatar/${Md5.hashStr(value as string)}`}
          width={field.column.fieldOptions.indexWidth as number}
          height={field.column.fieldOptions.indexHeight as number}
          alt={value as string}
          title={value as string}
          priority
        />
    </IndexFieldWrapper>;
};

export default memo(Index);

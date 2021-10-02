import { Code } from "@chakra-ui/layout";
import { Field } from "@/features/fields/types";
import { isNull } from "lodash";
import React, { memo } from "react";
import ShowFieldWrapper from "@/features/fields/components/FieldWrapper/ShowFieldWrapper";
import Image from "next/image";
import { Md5 } from "ts-md5";

const Show = ({ field }: { field: Field }) => {
  const value = isNull(field.value) ? <Code>null</Code> : field.value;

  return <ShowFieldWrapper field={field}>
    <Image
      src={`https://www.gravatar.com/avatar/${Md5.hashStr(value as string)}`}
      width={field.column.fieldOptions.showWidth as number}
      height={field.column.fieldOptions.showHeight as number}
      alt={value as string}
      title={value as string}/>
  </ShowFieldWrapper>
};

export default memo(Show);

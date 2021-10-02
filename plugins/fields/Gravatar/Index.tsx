import { Field } from "@/features/fields/types";
import { Md5 } from "ts-md5";
import Image from 'next/image';
import IndexFieldWrapper from "@/features/fields/components/FieldWrapper/IndexFieldWrapper";
import React, { memo } from "react";

const Index = ({ field }: { field: Field }) => (
  <IndexFieldWrapper field={field}>
    <Image src={"https://www.gravatar.com/avatar/" + Md5.hashStr(field.value as string)} alt="gravatar" />
  </IndexFieldWrapper>
);

export default memo(Index);

import { Field } from "@/features/fields/types";
import { Md5 } from "ts-md5";
import Image from 'next/image';
import React, { memo } from "react";
import ShowFieldWrapper from "@/features/fields/components/FieldWrapper/ShowFieldWrapper";

const Show = ({ field }: { field: Field }) => (
  <ShowFieldWrapper field={field}>
    <Image src={"https://www.gravatar.com/avatar/" + Md5.hashStr(field.value as string)} alt="gravatar" />
  </ShowFieldWrapper>
);

export default memo(Show);

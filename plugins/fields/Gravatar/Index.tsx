import { Field } from "@/features/fields/types";
import IndexFieldWrapper from "@/features/fields/components/FieldWrapper/IndexFieldWrapper";
import React, { memo } from "react";
import { Md5 } from "ts-md5";

const Index = ({ field }: { field: Field }) => (
  <IndexFieldWrapper field={field}>
    <img src="https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50" />
  </IndexFieldWrapper>

);

export default memo(Index);

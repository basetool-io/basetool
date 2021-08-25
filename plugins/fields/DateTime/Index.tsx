import { Field } from "@/features/fields/types";
import IndexFieldWrapper from "@/features/fields/components/FieldWrapper/IndexFieldWrapper";
import React, { memo } from "react";

const Show = ({ field }: { field: Field }) => (
  <IndexFieldWrapper field={field}>{field.value}</IndexFieldWrapper>
);

export default memo(Show);

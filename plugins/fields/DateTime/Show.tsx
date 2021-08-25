import ShowFieldWrapper from "@/features/fields/components/FieldWrapper/ShowFieldWrapper";
import { Field } from "@/features/fields/types";
import React, { memo } from "react";

const Show = ({ field }: { field: Field }) => (
  <ShowFieldWrapper field={field}>{field.value}</ShowFieldWrapper>
);

export default memo(Show);

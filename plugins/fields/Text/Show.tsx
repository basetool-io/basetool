import { Field } from "@/features/fields/types";
import React, { memo } from "react";
import ShowFieldWrapper from "@/features/fields/components/FieldWrapper/ShowFieldWrapper";

const Show = ({ field }: { field: Field }) => (
  <ShowFieldWrapper field={field}>{field.value}</ShowFieldWrapper>
);

export default memo(Show);

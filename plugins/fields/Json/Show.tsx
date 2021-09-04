import { Field } from "@/features/fields/types";
import { isUndefined } from "lodash"
import React, { memo } from "react";
import ShowFieldWrapper from "@/features/fields/components/FieldWrapper/ShowFieldWrapper";

const Show = ({ field }: { field: Field }) => {

  let value
  try {
    value = isUndefined(field.value) ? {} : JSON.stringify(field.value as string)
  } catch (e) {
    value = {}
  }

  return (
    <ShowFieldWrapper field={field}>{value}</ShowFieldWrapper>
)};

export default memo(Show);

import { Field } from "@/features/fields/types";
import { isUndefined } from "lodash";
import IndexFieldWrapper from "@/features/fields/components/FieldWrapper/IndexFieldWrapper";
import React, { memo } from "react";

const Index = ({ field }: { field: Field }) => {
  let value;
  try {
    value = isUndefined(field.value)
      ? "{}"
      : JSON.stringify(JSON.parse(field.value as string), null, 2);
  } catch (e) {
    value = "{}";
  }

  return <IndexFieldWrapper field={field}>{value}</IndexFieldWrapper>;
};

export default memo(Index);

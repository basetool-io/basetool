import { Field } from "@/features/fields/types";
import IndexFieldWrapper from "@/features/fields/components/FieldWrapper/IndexFieldWrapper";
import React, { memo } from "react";

const Index = ({ field }: { field: Field }) => {

  return <IndexFieldWrapper field={field}>{field.column.label}</IndexFieldWrapper>;
};

export default memo(Index);

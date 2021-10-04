import { Field } from "@/features/fields/types";
import React, { memo } from "react";
import ShowFieldWrapper from "@/features/fields/components/FieldWrapper/ShowFieldWrapper";

const Show = ({ field }: { field: Field }) => {
  console.log('field->', field)

  return <ShowFieldWrapper field={field}>{field?.column?.fieldOptions?.value}</ShowFieldWrapper>;
};

export default memo(Show);

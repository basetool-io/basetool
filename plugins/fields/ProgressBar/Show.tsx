import { Field } from "@/features/fields/types";
import React, { memo } from "react";
import ShowFieldWrapper from "@/features/fields/components/FieldWrapper/ShowFieldWrapper";

const Show = ({ field }: { field: Field }) => (
  <ShowFieldWrapper field={field}>
    <div className="text-center text-sm font-semibold w-full leading-none mb-1">
      {field.value}
    </div>
  <progress min={field.column.fieldOptions.max} max={field.column.fieldOptions.max} value={field.value as number} className="block w-24"></progress>
  </ShowFieldWrapper>
);

export default memo(Show);

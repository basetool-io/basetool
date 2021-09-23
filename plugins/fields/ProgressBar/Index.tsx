import { Field } from "@/features/fields/types";
import IndexFieldWrapper from "@/features/fields/components/FieldWrapper/IndexFieldWrapper";
import React, { memo } from "react";

const Index = ({ field }: { field: Field }) => (
  <IndexFieldWrapper field={field}>
     <div className="text-center text-sm font-semibold w-full leading-none mb-1">
      {field.value}
    </div>
  <progress min={field.column.fieldOptions.max} max={field.column.fieldOptions.max} value={field.value as number} className="block w-24"></progress>
  </IndexFieldWrapper>
);

export default memo(Index);

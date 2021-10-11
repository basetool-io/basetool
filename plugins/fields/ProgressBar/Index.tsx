import { Field } from "@/features/fields/types";
import { ProgressBarFieldOptions } from "./types";
import IndexFieldWrapper from "@/features/fields/components/FieldWrapper/IndexFieldWrapper";
import React, { memo } from "react";

const Index = ({ field }: { field: Field }) => (
  <IndexFieldWrapper field={field}>
    <div
      className="text-center text-sm font-semibold w-full leading-none mb-1"
      hidden={
        !(field.column.fieldOptions as ProgressBarFieldOptions).displayValue
      }
    >
      {field.value}
      {(field.column.fieldOptions as ProgressBarFieldOptions).valueSuffix}
    </div>
    <progress
      max={(field.column.fieldOptions as ProgressBarFieldOptions).max}
      value={field.value as number}
      className="block w-full"
    />
  </IndexFieldWrapper>
);

export default memo(Index);

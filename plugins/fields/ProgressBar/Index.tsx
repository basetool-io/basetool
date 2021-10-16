import { Field } from "@/features/fields/types";
import { ProgressBarFieldOptions } from "./types";
import IndexFieldWrapper from "@/features/fields/components/FieldWrapper/IndexFieldWrapper";
import React, { memo } from "react";

const Index = ({ field }: { field: Field }) => {
  const fieldOptions = field.column.fieldOptions as ProgressBarFieldOptions;

  return (
    <IndexFieldWrapper field={field}>
      <div
        className="text-center text-sm font-semibold w-full leading-none mb-1"
        hidden={fieldOptions.displayValue}
      >
        {field.value}
        {fieldOptions.valueSuffix}
      </div>
      <progress
        max={fieldOptions.max}
        value={field.value as number}
        className="block w-full"
      />
    </IndexFieldWrapper>
  );
};

export default memo(Index);

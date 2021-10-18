import { Field } from "@/features/fields/types";
import { ProgressBarFieldOptions } from "./types";
import React, { memo } from "react";
import ShowFieldWrapper from "@/features/fields/components/FieldWrapper/ShowFieldWrapper";

const Show = ({ field }: { field: Field }) => {
  const fieldOptions = field.column.fieldOptions as ProgressBarFieldOptions;

  return (
    <ShowFieldWrapper field={field}>
      <div
        className="text-center text-sm font-semibold w-full leading-none mb-1"
      >
        {fieldOptions.displayValue && <>
       	  {field.value}
          {fieldOptions.valueSuffix}
        </>}
      </div>
      <progress
        max={fieldOptions.max}
        value={field.value as number}
        className="block w-full"
      />
    </ShowFieldWrapper>
  );
};

export default memo(Show);

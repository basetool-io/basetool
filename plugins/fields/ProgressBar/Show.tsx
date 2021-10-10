import { Field } from "@/features/fields/types";
import { ProgressBarFieldOptions } from "./types";
import React, { memo } from "react";
import ShowFieldWrapper from "@/features/fields/components/FieldWrapper/ShowFieldWrapper";

const Show = ({ field }: { field: Field }) => (
  <ShowFieldWrapper field={field}>
    <div
      className="text-center text-sm font-semibold w-full leading-none mb-1"
      hidden={
        !(field.column.fieldOptions as ProgressBarFieldOptions).display_value
      }
    >
      {field.value}{" "}
      {(field.column.fieldOptions as ProgressBarFieldOptions).value_suffix}
    </div>
    <progress
      max={(field.column.fieldOptions as ProgressBarFieldOptions).max}
      value={field.value as number}
      className="block w-full"
    ></progress>
  </ShowFieldWrapper>
);

export default memo(Show);

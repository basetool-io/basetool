import { EditFieldProps } from "@/features/fields/types";
import EditFieldWrapper from "@/features/fields/components/FieldWrapper/EditFieldWrapper";
import React, { memo } from "react";

const Edit = ({ field }: EditFieldProps) => (
  <EditFieldWrapper field={field}>
    <div className="md:pr-4">{field.value}</div>
  </EditFieldWrapper>
);

export default memo(Edit);

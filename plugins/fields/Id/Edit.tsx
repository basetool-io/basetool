import { EditFieldProps } from "@/features/fields/types";
import EditFieldWrapper from "@/features/fields/components/FieldWrapper/EditFieldWrapper";
import React, { memo } from "react";

const Edit = ({ field }: EditFieldProps) => (
  <EditFieldWrapper field={field}>{field.value}</EditFieldWrapper>
);

export default memo(Edit);

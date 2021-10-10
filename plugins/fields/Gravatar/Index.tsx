import { Field } from "@/features/fields/types";

import IndexFieldWrapper from "@/features/fields/components/FieldWrapper/IndexFieldWrapper";
import React, { memo } from "react";

const Index = ({ field }: { field: Field }) => (
  <IndexFieldWrapper field={field}>
    <div></div>
  </IndexFieldWrapper>
);

export default memo(Index);

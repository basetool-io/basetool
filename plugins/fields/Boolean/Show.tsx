import { Field } from "@/features/fields/types";
import { isNull } from "lodash";
import BooleanCheck from "@/features/fields/components/BooleanCheck";
import EmptyDash from "@/features/fields/components/EmptyDash";
import React, { memo } from "react";
import ShowFieldWrapper from "@/features/fields/components/FieldWrapper/ShowFieldWrapper";

const Show = ({ field }: { field: Field }) => (
  <ShowFieldWrapper field={field}>
    {!isNull(field.value) && (
      <BooleanCheck checked={field.value as unknown as boolean} />
    )}
    {isNull(field.value) && <EmptyDash />}
  </ShowFieldWrapper>
);

export default memo(Show);

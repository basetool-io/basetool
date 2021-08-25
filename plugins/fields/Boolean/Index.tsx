import { isNull } from "lodash";
import React, { memo } from "react";
import BooleanCheck from "@/features/fields/components/BooleanCheck";
import { Field } from "@/features/fields/types";
import EmptyDash from "@/features/fields/components/EmptyDash";

const Show = ({ field }: { field: Field }) => (
  <>
    {!isNull(field.value) && (
      <BooleanCheck checked={field.value as unknown as boolean} />
    )}
    {isNull(field.value) && <EmptyDash />}
  </>
);

export default memo(Show);

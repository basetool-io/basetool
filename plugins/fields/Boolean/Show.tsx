import { Code } from "@chakra-ui/layout";
import { Field } from "@/features/fields/types";
import { isNull } from "lodash";
import BooleanCheck from "@/features/fields/components/BooleanCheck";
import React, { memo, useMemo } from "react";
import ShowFieldWrapper from "@/features/fields/components/FieldWrapper/ShowFieldWrapper";

const Show = ({ field }: { field: Field }) => {
  const isTruthy = useMemo(
    () => field.value === true || field.value === 1,
    [field.value]
  );

  return (
    <ShowFieldWrapper field={field}>
      {!isNull(field.value) && <BooleanCheck checked={isTruthy} />}
      {isNull(field.value) && <Code>null</Code>}
    </ShowFieldWrapper>
  );
};

export default memo(Show);

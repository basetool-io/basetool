import { Code } from "@chakra-ui/layout";
import { Field } from "@/features/fields/types";
import { isNull } from "lodash";
import BooleanCheck from "@/features/fields/components/BooleanCheck";
import React, { memo, useMemo } from "react";

const Index = ({ field }: { field: Field }) => {
  const isTruthy = useMemo(
    () => field.value === true || field.value === 1,
    [field.value]
  );

  return (
    <>
      {isNull(field.value) && <Code>null</Code>}
      {!isNull(field.value) && <BooleanCheck checked={isTruthy} />}
    </>
  );
};

export default memo(Index);

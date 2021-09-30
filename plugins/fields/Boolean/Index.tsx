import { Code } from "@chakra-ui/layout";
import { Field } from "@/features/fields/types";
import { isNull } from "lodash";
import BooleanCheck from "@/features/fields/components/BooleanCheck";
import React, { memo } from "react";

const Show = ({ field }: { field: Field }) => (
  <>
    {!isNull(field.value) && (
      <BooleanCheck checked={field.value as unknown as boolean} />
    )}
    {isNull(field.value) && <Code>null</Code>}
  </>
);

export default memo(Show);

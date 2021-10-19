import { Code } from "@chakra-ui/layout";
import { Field } from "@/features/fields/types";
import { isNull, isObjectLike, isUndefined } from "lodash";
import IndexFieldWrapper from "@/features/fields/components/FieldWrapper/IndexFieldWrapper";
import React, { memo } from "react";

const Index = ({ field }: { field: Field }) => {
  let value;
  try {
    value =
      isUndefined(field.value) || isNull(field.value)
        ? null
        : JSON.stringify(JSON.parse(field.value as string), null, 2);
  } catch (e) {
    value = field.value;
  }

  if (isObjectLike(field.value)) value = JSON.stringify(field.value);

  return (
    <IndexFieldWrapper field={field}>
      {isNull(value) ? (
        <Code>null</Code>
      ) : (
        <span className="font-mono">{value}</span>
      )}
    </IndexFieldWrapper>
  );
};

export default memo(Index);

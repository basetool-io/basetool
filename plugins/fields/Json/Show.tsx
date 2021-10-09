import { Code } from "@chakra-ui/layout";
import { Field } from "@/features/fields/types";
import { isNull, isUndefined } from "lodash";
import React, { memo } from "react";
import ShowFieldWrapper from "@/features/fields/components/FieldWrapper/ShowFieldWrapper";
import dynamic from "next/dynamic";

const Show = ({ field }: { field: Field }) => {
  const DynamicReactJson = dynamic(import("react-json-view"), { ssr: false });

  let value;
  try {
    value = (isUndefined(field.value) || isNull(field.value)) ? null : JSON.parse(field.value as string);
  } catch (e) {
    value = "{}";
  }

  return (
    <ShowFieldWrapper field={field}>
      {isNull(value) && <Code>null</Code>}
      {isNull(value) || <DynamicReactJson
        src={value}
        name={false}
        collapsed={false}
        displayObjectSize={true}
        displayDataTypes={true}
        enableClipboard={false}
      />}
    </ShowFieldWrapper>
  );
};

export default memo(Show);

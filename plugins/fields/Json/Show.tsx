import { Field } from "@/features/fields/types";
import { isUndefined } from "lodash"
import React, { memo } from "react";
import ShowFieldWrapper from "@/features/fields/components/FieldWrapper/ShowFieldWrapper";
import dynamic from 'next/dynamic'

const Show = ({ field }: { field: Field }) => {

  const DynamicReactJson = dynamic(import('react-json-view'), { ssr: false });

  let value
  try {
    value = isUndefined(field.value) ? '{}' : JSON.parse(field.value as string)
  } catch (e) {
    value = '{}'
  }

  return (
    <ShowFieldWrapper field={field}>
      <DynamicReactJson
        src={value}
        name={false}
        collapsed={false}
        displayObjectSize={true}
        displayDataTypes={true}
        enableClipboard={false}
      />
    </ShowFieldWrapper>
)};

export default memo(Show);

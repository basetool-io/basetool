import { Field } from "@/features/fields/types";
import React, { memo } from "react";
import ShowFieldWrapper from "@/features/fields/components/FieldWrapper/ShowFieldWrapper";
import dynamic from 'next/dynamic'
import isEmpty from "lodash"

const Show = ({ field }: { field: Field }) => {
  console.log('field.value->', isEmpty(field.value))

  const DynamicReactJson = dynamic(import('react-json-view'), { ssr: false });

  let value
  try {
    value = JSON.parse(field.value as string)
  } catch (e) {
    value = {}
  }
  value = isEmpty(field.value) ? {} : value;

  return (
  <ShowFieldWrapper field={field}>
    <DynamicReactJson
      src={value}
      // theme="monokai"
      name={false}
      collapsed={false}
      displayObjectSize={true}
      displayDataTypes={true}
      enableClipboard={false}
    />
  </ShowFieldWrapper>
)};

export default memo(Show);

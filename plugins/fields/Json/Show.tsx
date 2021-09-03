import { Field } from "@/features/fields/types";
import { isUndefined } from "lodash"
import React, { memo } from "react";
import ShowFieldWrapper from "@/features/fields/components/FieldWrapper/ShowFieldWrapper";

const Show = ({ field }: { field: Field }) => {

  // const DynamicReactJson = dynamic(import('react-json-view'), { ssr: false });

  let value
  try {
    value = isUndefined(field.value) ? {} : JSON.parse(field.value as string)
  } catch (e) {
    value = {}
  }

  return (
  <ShowFieldWrapper field={field}>
    {/* <AceEditor
      name={'json-editor-'+fieldId(field)}
      placeholder={''}
      defaultValue={JSON.stringify(value, null, '\t')}
      readOnly={true}
Z      editorProps={{ $blockScrolling: true }}
    /> */}
  </ShowFieldWrapper>
)};

export default memo(Show);

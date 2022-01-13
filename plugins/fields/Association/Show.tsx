import { Field, RecordAssociationValue } from "@/features/fields/types";
import GoToRecordLink from "@/features/fields/components/GoToRecordLink";
import React, { memo } from "react";
import ShowFieldWrapper from "@/features/fields/components/FieldWrapper/ShowFieldWrapper";

const Show = ({ field }: { field: Field<RecordAssociationValue> }) => {
  let value, dataSourceId, foreignTable, foreignId;

  if (field.value) {
    value = field.value.value
    dataSourceId = field.value.dataSourceId
    foreignTable = field.value.foreignTable
    foreignId = field.value.foreignId
  }

  return (
    <ShowFieldWrapper field={field}>
      {value}
      {foreignId && <GoToRecordLink
        href={`/data-sources/${dataSourceId}/tables/${foreignTable}/${foreignId}`}
      />}
    </ShowFieldWrapper>
  );
};

export default memo(Show);

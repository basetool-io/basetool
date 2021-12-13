import { Field, RecordAssociationValue } from "@/features/fields/types";
import GoToRecordLink from "@/features/fields/components/GoToRecordLink";
import React, { memo } from "react";
import ShowFieldWrapper from "@/features/fields/components/FieldWrapper/ShowFieldWrapper";

const Show = ({ field }: { field: Field }) => {
  const { value, dataSourceId, foreignTable, foreignId } =
    field.value as RecordAssociationValue;

  return (
    <ShowFieldWrapper field={field}>
      {value}
      <GoToRecordLink
        href={`/data-sources/${dataSourceId}/tables/${foreignTable}/${foreignId}`}
      />
    </ShowFieldWrapper>
  );
};

export default memo(Show);

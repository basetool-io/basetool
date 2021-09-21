import { DateTime } from "luxon";
import { Field } from "@/features/fields/types";
import { isNull } from "lodash";
import IndexFieldWrapper from "@/features/fields/components/FieldWrapper/IndexFieldWrapper";
import React, { memo } from "react";

const Show = ({ field }: { field: Field }) => {
  const date = DateTime.fromISO(field.value as string);
  const formattedDate = date.toLocaleString(DateTime.DATETIME_MED)

  return <IndexFieldWrapper field={field}>{!isNull(field.value) ? formattedDate : ""}</IndexFieldWrapper>;
};

export default memo(Show);

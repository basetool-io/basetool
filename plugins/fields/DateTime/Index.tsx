import { DateTime } from "luxon";
import { Field } from "@/features/fields/types";
import { dateFormat, dateTimeFormat, getBrowserTimezone } from "@/lib/time";
import IndexFieldWrapper from "@/features/fields/components/FieldWrapper/IndexFieldWrapper";
import React, { memo } from "react";

const Show = ({ field }: { field: Field }) => {
  const formattedDate = DateTime.fromISO(field.value as string)
    .setZone(getBrowserTimezone())
    .toFormat(field.column.fieldOptions.onlyDate ? dateFormat : dateTimeFormat);

  return <IndexFieldWrapper field={field}>{formattedDate}</IndexFieldWrapper>;
};

export default memo(Show);

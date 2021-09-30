import { DateTime } from "luxon";
import { Field } from "@/features/fields/types";
import { dateFormat, dateTimeFormat, getBrowserTimezone } from "@/lib/time";
import React, { memo } from "react";
import ShowFieldWrapper from "@/features/fields/components/FieldWrapper/ShowFieldWrapper";

const Show = ({ field }: { field: Field }) => {
  const formattedDate = DateTime.fromISO(field.value as string)
    .setZone(getBrowserTimezone())
    .toFormat(field.column.fieldOptions.onlyDate ? dateFormat : dateTimeFormat);

  return <ShowFieldWrapper field={field}>{formattedDate}</ShowFieldWrapper>;
};

export default memo(Show);

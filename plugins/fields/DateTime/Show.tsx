import { DateTime } from "luxon";
import { Field } from "@/features/fields/types";
import { dateTimeFormat, getBrowserTimezone } from "@/lib/time";
import React, { memo } from "react";
import ShowFieldWrapper from "@/features/fields/components/FieldWrapper/ShowFieldWrapper";

const Show = ({ field }: { field: Field }) => {
  const date = DateTime.fromISO(field.value as string);
  const formattedDate = date
    .setZone(getBrowserTimezone())
    .toFormat(dateTimeFormat);

  return <ShowFieldWrapper field={field}>{formattedDate}</ShowFieldWrapper>;
};

export default memo(Show);

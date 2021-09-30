import { Code } from "@chakra-ui/layout";
import { DateTime } from "luxon";
import { Field } from "@/features/fields/types";
import { dateFormat, dateTimeFormat, getBrowserTimezone } from "@/lib/time";
import { isNull } from "lodash";
import React, { memo } from "react";
import ShowFieldWrapper from "@/features/fields/components/FieldWrapper/ShowFieldWrapper";

const Show = ({ field }: { field: Field }) => {
  const formattedDate = DateTime.fromISO(field.value as string)
    .setZone(getBrowserTimezone())
    .toFormat(field.column.fieldOptions.onlyDate ? dateFormat : dateTimeFormat);

  return <ShowFieldWrapper field={field}>{isNull(field.value) ? <Code>null</Code> : formattedDate}</ShowFieldWrapper>;
};

export default memo(Show);

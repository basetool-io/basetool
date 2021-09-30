import { Code } from "@chakra-ui/layout";
import { DateTime } from "luxon";
import { Field } from "@/features/fields/types";
import { dateTimeFormat, getBrowserTimezone } from "@/lib/time";
import { isNull } from "lodash";
import IndexFieldWrapper from "@/features/fields/components/FieldWrapper/IndexFieldWrapper";
import React, { memo } from "react";

const Show = ({ field }: { field: Field }) => {
  const date = DateTime.fromISO(field.value as string);
  const formattedDate = date
    .setZone(getBrowserTimezone())
    .toFormat(dateTimeFormat);

  return <IndexFieldWrapper field={field}>{isNull(field.value) ? <Code>null</Code> : formattedDate}</IndexFieldWrapper>;
};

export default memo(Show);

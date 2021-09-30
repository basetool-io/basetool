import { Code } from "@chakra-ui/layout";
import { DateTime } from "luxon";
import { Field } from "@/features/fields/types";
import { dateTimeFormat, getBrowserTimezone } from "@/lib/time";
import { isNull } from "lodash";
import React, { memo } from "react";
import ShowFieldWrapper from "@/features/fields/components/FieldWrapper/ShowFieldWrapper";

const Show = ({ field }: { field: Field }) => {
  const date = DateTime.fromISO(field.value as string);
  const formattedDate = date
    .setZone(getBrowserTimezone())
    .toFormat(dateTimeFormat);

  return <ShowFieldWrapper field={field}>{isNull(field.value) ? <Code>null</Code> : formattedDate}</ShowFieldWrapper>;
};

export default memo(Show);

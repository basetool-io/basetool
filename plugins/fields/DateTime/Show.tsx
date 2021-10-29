import { Code } from "@chakra-ui/layout";
import { Field } from "@/features/fields/types";
import { getBrowserTimezone, getFormatFormFieldOptions } from "@/lib/time";
import { isNull } from "lodash";
import { parsed } from "./parsedValue";
import React, { memo } from "react";
import ShowFieldWrapper from "@/features/fields/components/FieldWrapper/ShowFieldWrapper";

const Show = ({ field }: { field: Field }) => {
  const format = getFormatFormFieldOptions(field.column.fieldOptions);

  const formattedDate = parsed(field.value)
    .setZone(getBrowserTimezone())
    .toFormat(format);

  return (
    <ShowFieldWrapper field={field}>
      {isNull(field.value) ? <Code>null</Code> : formattedDate}
    </ShowFieldWrapper>
  );
};

export default memo(Show);

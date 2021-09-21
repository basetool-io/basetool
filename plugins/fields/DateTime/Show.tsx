import { DateTime } from "luxon";
import { Field } from "@/features/fields/types";
import { isNull } from "lodash";
import React, { memo } from "react";
import ShowFieldWrapper from "@/features/fields/components/FieldWrapper/ShowFieldWrapper";

const Show = ({ field }: { field: Field }) => {
  const date = DateTime.fromISO(field.value as string);
  const formattedDate = date.toLocaleString(DateTime.DATETIME_MED)
  // console.log('field->', field)

  return <ShowFieldWrapper field={field}>date: {field.value} <br></br> formattedDate: {!isNull(field.value) ? formattedDate : ""}</ShowFieldWrapper>;
};

export default memo(Show);

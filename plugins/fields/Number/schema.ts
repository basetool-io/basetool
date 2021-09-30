import { Column } from "@/features/fields/types";
import Joi from "joi";
import type { Record } from "@/features/records/types";

const schema = (record: Record, column: Column) => {
  let rule = Joi.number();

  if (column.baseOptions.required) {
    rule = rule.required();
  } else {
    rule = rule.allow(null, "", NaN);
  }

  return rule;
};

export default schema;

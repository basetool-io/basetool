import { Column } from "@/features/fields/types";
import Joi from "joi";
import type { Record } from "@/features/records/types";

const schema = (record: Record, column: Column) => {
  const rule = Joi.number().allow(null, "", NaN);

  // rule = rule.allow(null)
  // if (column.nullable && !column.required) {
  //   console.log('nullable', column.name)
  //   rule = rule.allow(null)
  // } else {
  //   rule = rule.required()
  // }

  return rule;
};

export default schema;

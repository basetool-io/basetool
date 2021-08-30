import { Column } from "@/features/fields/types";
import Joi from "joi";
import type { Record } from '@/features/records/types'

const schema = (record: Record, column: Column) => {
  let rule = Joi.string();

  if (column.baseOptions.nullable && !column.baseOptions.required) {
    rule = rule.allow("");
  } else {
    rule = rule.required();
  }

  return rule;
};

export default schema;

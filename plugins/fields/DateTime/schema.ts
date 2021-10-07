import { Column } from "@/features/fields/types";
import Joi from "joi";
import type { Record } from "@/features/records/types";

const schema = (record: Record, column: Column) => {
  let rule = Joi.alternatives(Joi.date().iso(), Joi.date().timestamp());

  if (column.baseOptions.required || !column?.dataSourceInfo?.nullable) {
    rule = rule.required();
  } else {
    rule = rule.allow("", null);
  }

  return rule;
};

export default schema;

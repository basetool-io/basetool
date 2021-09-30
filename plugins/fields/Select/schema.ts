import { Column } from "@/features/fields/types";
import Joi from "joi";
import type { Record } from "@/features/records/types";

const schema = (record: Record, column: Column) => {
  let rule = Joi.string();

  if (column.baseOptions.required) {
    rule = rule.required();
  } else {
    rule = rule.allow("");
  }

  return rule;
};

export default schema;

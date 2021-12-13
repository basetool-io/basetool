import { Column } from "@/features/fields/types";
import Joi from "joi";
import type { BasetoolRecord } from "@/features/records/types";

const schema = (record: BasetoolRecord, column: Column) => {
  let rule = Joi.string();

  if (column.baseOptions.required) {
    rule = rule.required();
  } else {
    rule = rule.allow("");
  }

  return rule;
};

export default schema;

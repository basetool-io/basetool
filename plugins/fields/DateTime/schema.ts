import { Column } from "@/features/fields/types";
import Joi from "joi";
import type { BasetoolRecord } from "@/features/records/types";

const schema = (record: BasetoolRecord, column: Column) => {
  let rule = Joi.any();

  if (column.baseOptions.required || !column?.dataSourceInfo?.nullable) {
    rule = rule.required();
  } else {
    rule = rule.allow("", null);
  }

  return rule;
};

export default schema;

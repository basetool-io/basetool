import { Column } from "@/features/fields/types";
import Joi from "joi";
import type { BasetoolRecord } from "@/features/records/types";

const schema = (record: BasetoolRecord, column: Column) => {
  const rule = Joi.number().allow(null, "", NaN);

  return rule;
};

export default schema;

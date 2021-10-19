import { Column } from "@/features/fields/types";
import Joi from "joi";
import type { Record } from "@/features/records/types";

const schema = (record: Record, column: Column) => {
  const rule = Joi.number().allow(null, "", NaN);

  return rule;
};

export default schema;

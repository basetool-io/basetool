import Joi from "joi";

export const schema = Joi.object({
  name: Joi.string().min(3).required(),
  public: Joi.boolean().required(),
  dataSourceId: Joi.number().required(),
  tableName: Joi.string().required(),
  filters: Joi.array().items(Joi.object()),
});

import Joi from "joi";

export const schema = Joi.object({
  name: Joi.string().min(3).required(),
  isPublic: Joi.boolean().required(),
  dataSourceId: Joi.number().required(),
});

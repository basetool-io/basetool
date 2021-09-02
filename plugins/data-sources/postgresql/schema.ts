import Joi from "joi";

export const schema = Joi.object({
  name: Joi.string().min(3).required(),
  credentials: Joi.object({
    url: Joi.string().required(),
    useSsl: Joi.boolean(),
  }),
  type: Joi.string().valid("postgresql").required(),
});

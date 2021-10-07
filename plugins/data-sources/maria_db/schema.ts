import Joi from "joi";

export const schema = Joi.object({
  name: Joi.string().min(3).required(),
  type: Joi.string().allow("maria_db").required(),
  credentials: Joi.object({
    host: Joi.string().required(),
    port: Joi.number().required(),
    database: Joi.string().required(),
    user: Joi.string().required(),
    password: Joi.string().allow(""),
    useSsl: Joi.boolean(),
  }),
  organizationId: Joi.string().required(),
});

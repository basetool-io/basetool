import Joi from "joi";

export const schema = Joi.object({
  name: Joi.string().min(3).required(),
  type: Joi.string().allow('postgresql').required(),
  credentials: Joi.object({
    url: Joi.string().required(),
    useSsl: Joi.boolean(),
  }),
  organizationId: Joi.number().required()
});

import Joi from "joi";

export const schema = Joi.object({
  name: Joi.string().min(3).required(),
  type: Joi.string().allow("stripe").required(),
  credentials: Joi.object({
    secretKey: Joi.string().required(),
  }),
  organizationId: Joi.number().required(),
});

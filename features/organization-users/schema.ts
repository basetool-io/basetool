import Joi from "joi";

export const schema = Joi.object({
  roleId: Joi.number().required(),
});

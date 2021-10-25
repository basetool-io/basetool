import Joi from "joi";

export const schema = Joi.object({
  name: Joi.string().min(3).required(),
  type: Joi.string().allow('postgresql').required(),
  options: Joi.object({
    connectsWithSSH: Joi.boolean(),
    connectsWithSSHKey: Joi.boolean(),
  }),
  credentials: Joi.object({
    host: Joi.string().required(),
    port: Joi.number().required(),
    database: Joi.string().required(),
    user: Joi.string().required(),
    password: Joi.string().allow(""),
    useSsl: Joi.boolean(),
  }),
  ssh: Joi.object({
    host: Joi.string().allow(""),
    port: Joi.number().allow(""),
    user: Joi.string().allow(""),
    password: Joi.string().allow(""),
    key: Joi.any(),
    passphrase: Joi.string().allow(""),
  }),
  organizationId: Joi.number().required()
});

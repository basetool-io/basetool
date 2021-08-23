import Joi from 'joi'

export const schema = Joi.object({
  name: Joi.string()
    .min(3)
    .required(),
  options: Joi.object({
    baseUrl: Joi.string()
      .required(),
    headers: Joi.string().allow(null).allow('').optional(),
  }),
  type: Joi.string()
    .valid('http')
    .required(),
})

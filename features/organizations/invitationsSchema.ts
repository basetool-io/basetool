import Joi from "joi"

export const schema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9@$!%*?&]{6,30}$")),
  passwordConfirmation: Joi.ref("password"),
});

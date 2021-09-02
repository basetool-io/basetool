import Joi from "joi";

export const schema = Joi.object({
  csrfToken: Joi.string()
    .label("CSRF Token")
    .required(),
  email: Joi.string()
    .label("Email")
    .email({ tlds: { allow: false } })
    .required(),
  password: Joi.string().label("Password").min(6).required(),
  firstName: Joi.string().label("First name").allow(""),
  lastName: Joi.string().label("Last name").allow(""),
});

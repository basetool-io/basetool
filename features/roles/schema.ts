import { defaultAbilities } from "@/features/roles"
import Joi from "joi";

const abilities = defaultAbilities.map(({id}) => id)

export const schema = Joi.object({
  name: Joi.string().min(3).required(),
  options: Joi.object({
    abilities: Joi.array().items(...abilities.map((ability) => Joi.string().valid(ability))),
  }),
});

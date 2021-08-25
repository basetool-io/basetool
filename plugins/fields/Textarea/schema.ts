import { Column, Record } from '../types'
import Joi from 'joi'

const schema = (record: Record, column: Column) => {
  let rule = Joi.string()

  if (column.nullable && !column.required) {
    rule = rule.allow('')
  } else {
    rule = rule.required()
  }

  return rule
}

export default schema

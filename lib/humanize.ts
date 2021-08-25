import {
  capitalize, snakeCase, trim,
} from 'lodash'

export const humanize = (str: string) => capitalize(trim(snakeCase(str).replace(/_id$/, '').replace(/_/g, ' ')))

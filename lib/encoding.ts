import { isString } from 'lodash'
import isObject from 'lodash/isObject'

type ObjectType = [] | Record<string, any>

export const encodeObject = (payload: ObjectType): string => {
  let toEncode = ''
  if (isObject(payload)) toEncode = JSON.stringify(payload)

  return Buffer.from(toEncode).toString('base64')
}

export const decodeObject = (text: string): ObjectType => {
  if (!isString(text)) return {}

  const decodedString = Buffer.from(text, 'base64').toString()

  try {
    return JSON.parse(decodedString)
  } catch (error) {
    return {}
  }
}

import { ArrayOrObject } from '@/types'
import { isString } from 'lodash'
import isObject from 'lodash/isObject'

export const encodeObject = (payload: ArrayOrObject | undefined): string => {
  let toEncode = ''
  if (isObject(payload)) toEncode = JSON.stringify(payload)

  return Buffer.from(toEncode).toString('base64')
}

export const decodeObject = (text: string): ArrayOrObject | undefined => {
  if (!isString(text)) return

  const decodedString = Buffer.from(text, 'base64').toString()

  try {
    return JSON.parse(decodedString)
  } catch (error) {
    return
  }
}

import crypto from 'crypto'
import isString from 'lodash/isString'

const algorithm = 'aes-256-ctr'
const ENCRYPTION_KEY = (process.env.SECRET as string)
const IV_LENGTH = 16

export const encrypt = (text: string) => {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'hex'), iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])

  return `${iv.toString('hex')}:${encrypted.toString('hex')}`
}

export const decrypt = (text: string): string | undefined => {
  const textParts = text.split(':')
  const textIv = textParts[0]

  if (!textIv || !isString(textIv)) return ''

  const iv = Buffer.from(textIv, 'hex')
  const encryptedText = Buffer.from(textParts[1], 'hex')
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'hex'), iv)
  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])

  return decrypted.toString()
}

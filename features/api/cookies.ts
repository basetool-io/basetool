import { CookieSerializeOptions, serialize } from 'cookie'
import { NextApiRequest, NextApiResponse } from 'next'

/**
 * This sets `cookie` using the `res` object
 */
export const setCookie = (
  res: NextApiResponse,
  name: string,
  value: unknown,
  options: CookieSerializeOptions = {},
) => {
  const stringValue = typeof value === 'object' ? `j:${JSON.stringify(value)}` : String(value)

  if ('maxAge' in options && options?.maxAge) {
    options.expires = new Date(Date.now() + options?.maxAge)
    options.maxAge /= 1000
  }

  res.setHeader('Set-Cookie', serialize(name, String(stringValue), options))
}

// Get the value of a cookie from a request object
export const getCookie = (
  req: NextApiRequest,
  name: string,
) => {
  if (req.cookies[name]) {
    if (req.cookies[name].includes('j:')) {
      return JSON.parse(req.cookies[name].replace('j:', ''))
    }

    return req.cookies[name]
  }
}

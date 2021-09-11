import { OAUTH_USER_ID_COOKIE } from '@/plugins/data-sources/google-sheets/constants'
import { encrypt } from '@/lib/crypto'
import { getSession } from 'next-auth/client'
import { google } from 'googleapis'
import { setCookie } from '@/features/api/cookies'
import { withSentry } from '@sentry/nextjs'
import plugin from '@/plugins/data-sources/google-sheets'
import type { NextApiRequest, NextApiResponse } from 'next'

const handle = async (req: NextApiRequest, res: NextApiResponse<{url: string}>) => {
  const session = await getSession({ req })

  if (session) {
    // Create an oAuth2 client to authorize the API call
    const client = new google.auth.OAuth2(
      process.env.GSHEETS_CLIENT_ID,
      process.env.GSHEETS_CLIENT_SECRET,
      process.env.GSHEETS_REDIRECT_URI,
    )

    // Generate the url that will be used for authorization
    const url = client.generateAuthUrl({
      // eslint-disable-next-line camelcase
      access_type: 'offline',
      scope: plugin.oauthScopes,
    })

    const payload = {
      email: session?.user?.email,
      name: req.body.name,
    }

    // Encrypt the data source info
    const encryptedPayload = encrypt(JSON.stringify(payload))

    // Set a cookie
    setCookie(res, OAUTH_USER_ID_COOKIE, encryptedPayload)
    // https://avvo.ngrok.io/api/oauth/googlesheets/url

    return res.status(200).send({ url })
  }

  res.redirect(302, '/auth/login')
}

export default withSentry(handle)

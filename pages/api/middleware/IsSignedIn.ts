import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/client'

const IsSignedIn = (handler: NextApiHandler) => async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req })

  if (!session) {
    return res.status(404).send('')
  }

  return handler(req, res)
}

export default IsSignedIn

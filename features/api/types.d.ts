import { NextApiRequest } from "next"

export type BasetoolApiRequest = NextApiRequest & {
  subdomain: string
}

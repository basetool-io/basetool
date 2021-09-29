import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

const VerifyKeepAlive =
  (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.query.keep_alive) return res.send('OK')

    return handler(req, res);
  };

export default VerifyKeepAlive;

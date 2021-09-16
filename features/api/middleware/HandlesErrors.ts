import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import ApiResponse from "../ApiResponse";

const HandlesErrors =
  (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error: any) {
      if (!res.headersSent)
        res
          .status(405)
          .send(ApiResponse.withError(error.message, { meta: error }));
    }
  };

export default HandlesErrors;

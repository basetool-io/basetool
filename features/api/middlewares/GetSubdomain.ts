import { BasetoolApiRequest } from "../types";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { isUndefined } from "lodash";
import isNull from "lodash/isNull";

const GetSubdomain =
  (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    const reg = new RegExp(`(.*).${process.env.BASE_URL}`);
    const matches = req.headers.host?.match(reg);

    if (!isNull(matches) && !isUndefined(matches) && matches?.length > 0) {
      (req as BasetoolApiRequest).subdomain = matches[1];
    }

    return handler(req, res);
  };

export default GetSubdomain;

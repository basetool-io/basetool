import { BasetoolApiRequest } from "../types";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

const GetSubdomain =
  (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    // Remove the port if present
    const baseUrl = req.headers.host?.split(":")[0];
    // Get the first segment
    const subdomain = baseUrl?.split(".")[0];
    // Assign it to the req
    (req as BasetoolApiRequest).subdomain = subdomain;

    return handler(req, res);
  };

export default GetSubdomain;

import { withMiddlewares } from "@/features/api/middleware";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({ hi: "there" });
};

export default withMiddlewares(handler);

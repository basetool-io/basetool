import { withMiddlewares } from "@/features/api/middleware";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.query.error) throw new Error('hey you')

  res.status(200).json({ name: "John Doe" });
};

export default withMiddlewares(handler);

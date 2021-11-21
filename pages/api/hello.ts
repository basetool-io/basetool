import { isNull } from "lodash"
import { withMiddlewares } from "@/features/api/middleware";
import options from "@/features/options"
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log(await options.set('runInProxy', 1))
  const t = await options.get('runInProxy')
  console.log(isNull(t))
  res.status(200).json({ hi: "there" });
};

export default withMiddlewares(handler);

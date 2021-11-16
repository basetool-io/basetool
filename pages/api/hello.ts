import { withMiddlewares } from "@/features/api/middleware";
import prisma from "@/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const response = await prisma.dataSource.findMany({});
  res.status(200).json(response);
};

export default withMiddlewares(handler);

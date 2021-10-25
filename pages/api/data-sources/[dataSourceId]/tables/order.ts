import { getDataSourceFromRequest, getUserFromRequest } from "@/features/api";
import { merge } from "lodash";
import { serverSegment } from "@/lib/track";
import { withMiddlewares } from "@/features/api/middleware";
import ApiResponse from "@/features/api/ApiResponse";
import IsSignedIn from "@/features/api/middlewares/IsSignedIn";
import OwnsDataSource from "@/features/api/middlewares/OwnsDataSource";
import prisma from "@/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  switch (req.method) {
    case "PUT":
      return handlePUT(req, res);
    default:
      return res.status(404).send("");
  }
};

async function handlePUT(req: NextApiRequest, res: NextApiResponse) {
  const dataSource = await getDataSourceFromRequest(req);

  if (!dataSource) return res.status(404).send("");

  const user = await getUserFromRequest(req);

  const options = merge(dataSource.options, {
    tables: req.body.tables,
  });

  await prisma.dataSource.update({
    where: {
      id: parseInt(req.query.dataSourceId as string, 10),
    },
    data: {
      options,
    },
  });

  serverSegment().track({
    userId: user ? user.id : "",
    event: "Re-odered tables.",
    properties: {
      id: dataSource.type,
    },
  });

  return res.json(ApiResponse.withMessage("Updated order"));
}

export default withMiddlewares(handler, {
  middlewares: [
    [IsSignedIn, {}],
    [OwnsDataSource, {}],
  ],
});

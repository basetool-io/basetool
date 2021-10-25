import { DataSource } from "@prisma/client";
import { getDataSourceFromRequest, getUserFromRequest } from "@/features/api";
import { merge } from "lodash"
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
  const dataSource = (await getDataSourceFromRequest(req)) as DataSource | null;

  if (!dataSource) return res.status(404).send("");

  if (!req.body)
    return res.send(ApiResponse.withError("No data sent."));

  const user = await getUserFromRequest(req);
  const dataSourceOptions = dataSource.options as Record<string, unknown>

  const options = merge(dataSourceOptions, {
    tables: {
      [req.query.tableName as string]: req.body
    }
  })

  if (dataSource && dataSource?.options) {
    const result = await prisma.dataSource.update({
      where: {
        id: parseInt(req.query.dataSourceId as string, 10),
      },
      data: {
        options: options as any,
      }
    });

    serverSegment().track({
      userId: user ? user.id : "",
      event: "Re-odered table columns.",
      properties: {
        id: dataSource.type,
      },
    });

    return res.json(ApiResponse.withData(result, { message: "Updated" }));
  }

  res.status(404).send("");
}

export default withMiddlewares(handler, {
  middlewares: [
    [IsSignedIn, {}],
    [OwnsDataSource, {}],
  ],
});

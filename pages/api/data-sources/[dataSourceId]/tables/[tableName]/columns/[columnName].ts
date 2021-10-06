import { getDataSourceFromRequest } from "@/features/api";
import { omit } from "lodash";
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
    case "DELETE":
      return handleDELETE(req, res);
    default:
      return res.status(404).send("");
  }
};

async function handleDELETE(req: NextApiRequest, res: NextApiResponse) {
  const dataSource = await getDataSourceFromRequest(req);

  if (
    !dataSource ||
    !req?.query?.tableName ||
    !req?.query?.columnName ||
    !dataSource?.options
  )
    return res.status(404).send("");

  const result = await prisma.dataSource.update({
    where: {
      id: parseInt(req.query.dataSourceId as string, 10),
    },
    data: {
      options: omit(dataSource?.options as Record<string, unknown>, [
        `tables.${req.query.tableName as string}.columns.${
          req.query.columnName as string
        }`,
      ]) as any,
    },
  });

  return res.json(
    ApiResponse.withData(result, {
      message: `Removed field ${req.query.columnName}`,
    })
  );
}

export default withMiddlewares(handler, {
  middlewares: [
    [IsSignedIn, {}],
    [OwnsDataSource, {}],
  ],
});

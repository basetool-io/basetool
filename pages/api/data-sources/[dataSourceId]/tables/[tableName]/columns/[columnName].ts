import { getDataSourceFromRequest, getUserFromRequest } from "@/features/api";
import { merge } from "lodash";
import { omit } from "lodash";
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
    case "DELETE":
      return handleDELETE(req, res);
    case "PUT":
      return handlePUT(req, res);
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

  const options = omit(dataSource?.options as Record<string, unknown>, [
    `tables.${req.query.tableName as string}.columns.${
      req.query.columnName as string
    }`,
  ]) as any;

  const result = await prisma.dataSource.update({
    where: {
      id: parseInt(req.query.dataSourceId as string, 10),
    },
    data: {
      options,
    },
  });

  return res.json(
    ApiResponse.withData(result, {
      message: `Removed field ${req.query.columnName}`,
    })
  );
}

async function handlePUT(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromRequest(req);
  const dataSource = await getDataSourceFromRequest(req);

  if (!req.body.changes)
    return res.send(ApiResponse.withError("No changes sent."));

  if (!dataSource || !req?.query?.tableName) return res.status(404).send("");

  const options = merge(dataSource.options, {
    tables: {
      [req.query.tableName as string]: {
        columns: {
          [req.query.columnName as string]: req.body.changes,
        },
      },
    },
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
    event: "Updated columns",
    properties: {
      id: dataSource.type,
      columnNames: Object.keys(req.body.changes),
    },
  });

  return res.json(ApiResponse.withMessage("Updated"));
}

export default withMiddlewares(handler, {
  middlewares: [
    [IsSignedIn, {}],
    [OwnsDataSource, {}],
  ],
});

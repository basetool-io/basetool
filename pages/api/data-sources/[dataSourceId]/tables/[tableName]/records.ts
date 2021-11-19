import { getDataSourceFromRequest, getUserFromRequest } from "@/features/api";
import { runQuery } from "@/plugins/data-sources/serverHelpers";
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
    case "POST":
      return handlePOST(req, res);
    default:
      return res.status(404).send("");
  }
};

async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
  if (!req?.body?.record || Object.keys(req.body.record).length === 0)
    return res.send(ApiResponse.withError("No record sent."));
  const dataSource = await getDataSourceFromRequest(req);

  if (!dataSource) return res.status(404).send("");

  const user = await getUserFromRequest(req);

  const { record } = req.body;

  const data = await runQuery(dataSource, "createRecord", {
    tableName: req.query.tableName as string,
    data: record,
  });

  serverSegment().track({
    userId: user ? user.id : "",
    event: "Created record",
    properties: {
      id: dataSource.type,
    },
  });

  // todo - find a way to pass viewId in the request
  const activityData = {
    recordId: data.toString() as string,
    userId: user ? user.id : 0,
    organizationId: dataSource ? (dataSource.organizationId as number) : 0,
    tableName: req.query.tableName
      ? (req.query.tableName as string)
      : undefined,
    dataSourceId: dataSource ? (dataSource.id as number) : undefined,
    viewId: req.query.viewId ? parseInt(req.query.viewId as string) : undefined,
    action: "create",
    changes: {},
  };

  await prisma.activity.create({
    data: activityData,
  });

  res.json(ApiResponse.withData({ id: data }, { message: "Record added" }));
}

export default withMiddlewares(handler, {
  middlewares: [
    [IsSignedIn, {}],
    [OwnsDataSource, {}],
  ],
});

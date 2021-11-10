import { getDataSourceFromRequest, getUserFromRequest } from "@/features/api";
import { serverSegment } from "@/lib/track"
import { withMiddlewares } from "@/features/api/middleware";
import ApiResponse from "@/features/api/ApiResponse";
import IsSignedIn from "@/features/api/middlewares/IsSignedIn";
import OwnsDataSource from "@/features/api/middlewares/OwnsDataSource";
import getQueryService from "@/plugins/data-sources/getQueryService";
import pluralize from "pluralize";
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
  const user = await getUserFromRequest(req);
  const dataSource = await getDataSourceFromRequest(req);

  if (!dataSource) return res.status(404).send("");

  const service = await getQueryService({ dataSource });

  const data = await service.runQuery("deleteRecords", {
    tableName: req.query.tableName as string,
    recordIds: req.body as number[],
  });

  serverSegment().track({
    userId: user ? user.id : "",
    event: "Bulk Delete",
    properties: {
      id: dataSource.type,
    },
  });

   // todo - find a way to pass viewId in the request
   const activityData = {
    recordId: req.body.toString(),
    userId: user ? user.id : 0,
    organizationId: dataSource ? (dataSource.organizationId as number) : 0,
    tableName: req.query.tableName
      ? (req.query.tableName as string)
      : undefined,
    dataSourceId: dataSource ? (dataSource.id as number) : undefined,
    viewId: req.query.viewId ? parseInt(req.query.viewId as string) : undefined,
    action: "bulkDelete",
    changes: {},
  };

  await prisma.activity.create({
    data: activityData,
  });

  res.json(
    ApiResponse.withData(data, {
      message: `Deleted ${req.body.length} ${pluralize(
        "record",
        req.body.length
      )} from ${req.query.tableName}`,
    })
  );
}

export default withMiddlewares(handler, {
  middlewares: [
    [IsSignedIn, {}],
    [OwnsDataSource, {}],
  ],
});

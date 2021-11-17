import { getDataSourceFromRequest, getUserFromRequest } from "@/features/api";
import { serverSegment } from "@/lib/track";
import { withMiddlewares } from "@/features/api/middleware";
import ApiResponse from "@/features/api/ApiResponse";
import IsSignedIn from "@/features/api/middlewares/IsSignedIn";
import OwnsDataSource from "@/features/api/middlewares/OwnsDataSource";
import getDataSourceInfo from "@/plugins/data-sources/getDataSourceInfo";
import prisma from "@/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  switch (req.method) {
    case "GET":
      return handleGET(req, res);
    case "PUT":
      return handlePUT(req, res);
    case "DELETE":
      return handleDELETE(req, res);
    default:
      return res.status(404).send("");
  }
};

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  const dataSource = await getDataSourceFromRequest(req, {
    select: {
      id: true,
      name: true,
      type: true,
      options: true,
      organizationId: true,
    },
  });

  if (!dataSource) return res.status(404).send("");

  const dataSourceInfo = await getDataSourceInfo(dataSource.type);

  res.json(
    ApiResponse.withData(dataSource, {
      meta: {
        dataSourceInfo: {
          readOnly: dataSourceInfo?.readOnly || false,
          supports: dataSourceInfo?.supports || {},
          pagination: dataSourceInfo?.pagination,
        },
      },
    })
  );
}

async function handlePUT(req: NextApiRequest, res: NextApiResponse) {

  const dataSource = await getDataSourceFromRequest(req);

  if (!dataSource) return res.status(404).send("");

  const user = await getUserFromRequest(req);

  await prisma.dataSource.update({
    where: {
      id: parseInt(req.query.dataSourceId as string, 10),
    },
    data: {
      name: req.body.name,
    },
  });

  serverSegment().track({
    userId: user ? user.id : "",
    event: "Updated data source",
    properties: {
      id: dataSource?.type,
    },
  });

  return res.json(ApiResponse.withMessage("Updated"));
}

async function handleDELETE(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromRequest(req);
  const dataSource = await getDataSourceFromRequest(req);

  await prisma.dataSource.delete({
    where: {
      id: parseInt(req.query.dataSourceId as string, 10),
    },
  });

  serverSegment().track({
    userId: user ? user.id : "",
    event: "Deleted data source",
    properties: {
      id: dataSource?.type,
    },
  });

  return res.json(ApiResponse.withMessage("Data source removed."));
}

export default withMiddlewares(handler, {
  middlewares: [
    [IsSignedIn, {}],
    [OwnsDataSource, {}],
  ],
});

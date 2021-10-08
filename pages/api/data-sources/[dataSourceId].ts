import { getDataSourceFromRequest, getUserFromRequest } from "@/features/api";
import { merge } from "lodash";
import { serverSegment } from "@/lib/track";
import { withMiddlewares } from "@/features/api/middleware";
import ApiResponse from "@/features/api/ApiResponse";
import IsSignedIn from "../../../features/api/middlewares/IsSignedIn";
import OwnsDataSource from "../../../features/api/middlewares/OwnsDataSource";
import getSchema from "@/plugins/data-sources/getSchema";
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

  res.json(ApiResponse.withData(dataSource));
}

async function handlePUT(req: NextApiRequest, res: NextApiResponse) {
  const data = req.body;
  const schema = await getSchema(req.body.type);

  if (schema) {
    const validator = schema.validate(data, { abortEarly: false });

    if (validator.error) {
      return res.json(ApiResponse.withValidation(validator));
    }
  }

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
    event: "Updated data source",
    properties: {
      id: dataSource.type,
    },
  });

  return res.json(ApiResponse.withMessage("Updated"));
}

async function handleDELETE(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromRequest(req);
  const dataSource = await prisma.dataSource.findFirst({
    where: {
      id: parseInt(req.query.dataSourceId as string, 10),
    },
  });

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

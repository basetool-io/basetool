import { getDataSourceFromRequest } from "@/features/api";
import { merge } from "lodash";
import { withSentry } from "@sentry/nextjs";
import ApiResponse from "@/features/api/ApiResponse";
import IsSignedIn from "../../../features/api/middlewares/IsSignedIn";
import OwnsDataSource from "../../../features/api/middlewares/OwnsDataSource";
import getSchema from "@/plugins/data-sources/getSchema";
import prisma from "@/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

const handle = async (
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

  const previousData = await prisma.dataSource.findUnique({
    where: {
      id: parseInt(req.query.dataSourceId as string, 10),
    },
  });

  const result = await prisma.dataSource.update({
    where: {
      id: parseInt(req.query.dataSourceId as string, 10),
    },
    data: {
      options: {
        tables: merge((previousData?.options as any).tables, data),
      },
    },
  });

  return res.json(ApiResponse.withData(result, { message: "Updated" }));
}

async function handleDELETE(req: NextApiRequest, res: NextApiResponse) {
  await prisma.dataSource.delete({
    where: {
      id: parseInt(req.query.dataSourceId as string, 10),
    },
  });

  return res.json(ApiResponse.withMessage("Data source removed."));
}

export default withSentry(IsSignedIn(OwnsDataSource(handle)));

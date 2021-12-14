import { getUserFromRequest } from "@/features/api";
import { schema } from "@/features/dashboards/schema";
import { serverSegment } from "@/lib/track";
import { withMiddlewares } from "@/features/api/middleware";
import ApiResponse from "@/features/api/ApiResponse";
import IsSignedIn from "@/features/api/middlewares/IsSignedIn";
import prisma from "@/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  switch (req.method) {
    case "GET":
      return handleGET(req, res);
    case "DELETE":
      return handleDELETE(req, res);
    case "PUT":
      return handlePUT(req, res);
    default:
      return res.status(404).send("");
  }
};

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  const dashboard = await prisma.dashboard.findFirst({
    where: {
      id: parseInt(req.query.dashboardId as string, 10),
    },
    select: {
      id: true,
      name: true,
      isPublic: true,
      createdBy: true,
      organizationId: true,
      createdAt: true,
      updatedAt: true,
      dataSourceId: true,
      widgets: true,
    },
  });

  res.json(ApiResponse.withData(dashboard));
}

async function handleDELETE(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromRequest(req);

  await prisma.dashboard.delete({
    where: {
      id: parseInt(req.query.dashboardId as string, 10),
    },
  });

  serverSegment().track({
    userId: user ? user.id : "",
    event: "Deleted dashboard",
    properties: {
      id: req.query.dashboardId,
    },
  });

  return res.json(ApiResponse.withMessage("Dashboard removed."));
}

async function handlePUT(req: NextApiRequest, res: NextApiResponse) {
  const data = req.body;

  if (schema) {
    const validator = schema.validate(data, { abortEarly: false });

    if (validator.error) {
      return res.json(ApiResponse.withValidation(validator));
    }
  }

  const user = await getUserFromRequest(req);

  await prisma.dashboard.update({
    where: {
      id: parseInt(req.query.dashboardId as string, 10),
    },
    data: data,
  });

  serverSegment().track({
    userId: user ? user.id : "",
    event: "Updated dashboard",
    properties: {
      id: req.query.dashboardId,
    },
  });

  return res.json(ApiResponse.withMessage("Updated"));
}

export default withMiddlewares(handler, {
  middlewares: [
    [IsSignedIn, {}],
  ],
});

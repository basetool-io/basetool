import { getUserFromRequest } from "@/features/api";
import { serverSegment } from "@/lib/track";
import { withMiddlewares } from "@/features/api/middleware";
import ApiResponse from "@/features/api/ApiResponse";
import HasAccessToDashboard from "@/features/api/middlewares/HasAccessToDashboard";
import IsSignedIn from "@/features/api/middlewares/IsSignedIn";
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
  const user = await getUserFromRequest(req);

  await prisma.widget.delete({
    where: {
      id: parseInt(req.query.widgetId as string, 10),
    },
  });

  serverSegment().track({
    userId: user ? user.id : "",
    event: "Deleted widget",
    properties: {
      id: req.query.widgetId,
    },
  });

  return res.json(ApiResponse.withMessage("Widget removed."));
}

async function handlePUT(req: NextApiRequest, res: NextApiResponse) {
  const data = req.body;

  const user = await getUserFromRequest(req);

  const widget = await prisma.widget.findFirst({
    where: {
      id: parseInt(req.query.widgetId as string, 10),
    },
    select: {
      options: true,
    },
  });

  if (!widget) return res.status(404).send("");

  const options = {
    ...(widget.options as Record<string, unknown>),
    ...data.options,
  };

  await prisma.widget.update({
    where: {
      id: parseInt(req.query.widgetId as string, 10),
    },
    data: {
      ...data,
      options,
    },
  });

  serverSegment().track({
    userId: user ? user.id : "",
    event: "Updated widget",
    properties: {
      id: req.query.widgetId,
    },
  });

  return res.json(ApiResponse.withMessage("Updated"));
}

export default withMiddlewares(handler, {
  middlewares: [
    [IsSignedIn, {}],
    [HasAccessToDashboard, {}],
  ],
});

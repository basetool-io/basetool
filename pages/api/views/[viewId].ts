import { getUserFromRequest } from "@/features/api";
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
    default:
      return res.status(404).send("");
  }
};

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  const view = await prisma.view.findFirst({
    where: {
      id: parseInt(
        req.query.viewId as string,
        10
      ),
    },
    select: {
      id: true,
      name: true,
      public: true,
      createdBy: true,
      organizationId: true,
      dataSourceId: true,
      tableName: true,
      filters: true,
    },
  });

  res.json(ApiResponse.withData(view));
}

async function handleDELETE(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromRequest(req);

  await prisma.view.delete({
    where: {
      id: parseInt(req.query.viewId as string, 10),
    },
  });

  serverSegment().track({
    userId: user ? user.id : "",
    event: "Deleted view",
    properties: {
      id: req.query.viewId,
    },
  });

  return res.json(ApiResponse.withMessage("View removed."));
}

export default withMiddlewares(handler, {
  middlewares: [
    [IsSignedIn, {}],
  ],
});

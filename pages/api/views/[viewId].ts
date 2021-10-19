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

export default withMiddlewares(handler, {
  middlewares: [
    [IsSignedIn, {}],
  ],
});

import { runQuery } from "@/plugins/data-sources/serverHelpers";
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
  if (!dashboard) return res.status(404).send("");

  const dataSource = await prisma.dataSource.findFirst({
    where: {
      id: dashboard.dataSourceId,
    },
  });
  if (!dataSource) return res.status(404).send("");

  const response: { id: number; value?: string; error?: string }[] = [];

  for (const widget of dashboard.widgets) {
    try {
      const queryValue = await runQuery(dataSource, "runRawQuery", {
        query: widget.query,
      });

      response.push({
        id: widget.id,
        value: queryValue.value,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      response.push({
        id: widget.id,
        error: e.message,
      });
    }
  }

  res.json(ApiResponse.withData(response));
}

export default withMiddlewares(handler, {
  middlewares: [[IsSignedIn, {}]],
});

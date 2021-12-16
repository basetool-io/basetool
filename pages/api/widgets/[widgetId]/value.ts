import { WidgetValue } from "@/features/dashboards/types";
import { getValueForWidget } from "@/features/dashboards/server-helpers";
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
    case "GET":
      return handleGET(req, res);
    default:
      return res.status(404).send("");
  }
};

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  const widget = await prisma.widget.findFirst({
    where: {
      id: parseInt(req.query.widgetId as string, 10),
    },
    select: {
      id: true,
      dashboardId: true,
      query: true,
    },
  });

  if (!widget) return res.status(404).send("");

  const dashboard = await prisma.dashboard.findFirst({
    where: {
      id: widget.dashboardId,
    },
    select: {
      dataSourceId: true,
    },
  });

  if (!dashboard) return res.status(404).send("");

  const dataSource = await prisma.dataSource.findFirst({
    where: {
      id: dashboard.dataSourceId,
    },
  });

  if (!dataSource) return res.status(404).send("");

  const response: WidgetValue = await getValueForWidget(widget, dataSource);

  res.json(ApiResponse.withData(response));
}

export default withMiddlewares(handler, {
  middlewares: [
    [IsSignedIn, {}],
    [HasAccessToDashboard, {}],
  ],
});

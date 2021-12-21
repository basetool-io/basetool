import { Widget } from "@prisma/client";
import { getUserFromRequest } from "@/features/api";
import { isArray } from "lodash";
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
    case "PUT":
      return handlePUT(req, res);
    default:
      return res.status(404).send("");
  }
};

async function handlePUT(req: NextApiRequest, res: NextApiResponse) {
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
  const order = req?.body?.order;
  const widgets = dashboard?.widgets;

  if (!dashboard || !order || !widgets) return res.status(404).send("");

  if (widgets && isArray(widgets)) {
    order.forEach((widgetName: string, orderIndex: number) => {
      const widgetIndex = (widgets as Widget[]).findIndex(
        (w) => w.name === widgetName
      );

      if (widgets && orderIndex > -1) {
        widgets[widgetIndex].order = orderIndex;
      }
    });

    for (const widget of widgets) {
      await prisma.widget.update({
        where: {
          id: widget.id,
        },
        data: {
          order: widget.order,
        },
      });
    }

    const user = await getUserFromRequest(req);

    serverSegment().track({
      userId: user ? user.id : "",
      email: user ? user?.email : "",
      event: "Re-odered widgets in a dashboard",
      properties: {
        dashboardId: req.query.dashboardId as string,
      },
    });
  }

  return res.json(ApiResponse.ok());
}

export default withMiddlewares(handler, {
  middlewares: [
    [IsSignedIn, {}],
    [HasAccessToDashboard, {}],
  ],
});

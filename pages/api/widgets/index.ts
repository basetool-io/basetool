import {
  OrganizationUser,
  User,
} from "@prisma/client";
import { getUserFromRequest } from "@/features/api";
import { parseInt, pick } from "lodash";
import { serverSegment } from "@/lib/track";
import { withMiddlewares } from "@/features/api/middleware";
import ApiResponse from "@/features/api/ApiResponse";
import IsSignedIn from "../../../features/api/middlewares/IsSignedIn";
import prisma from "@/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  switch (req.method) {
    case "POST":
      return handlePOST(req, res);
    default:
      return res.status(404).send("");
  }
};

async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
  const user = (await getUserFromRequest(req, {
    select: {
      id: true,
      organizations: {
        include: {
          organization: true,
        },
      },
    },
  })) as User & {
    organizations: OrganizationUser[];
  };
  const organizationId = user.organizations[0].organizationId;

  if (!user || !organizationId) return res.status(404).send("");

  if (!req.body.name || !req.body.dashboardId) return res.status(404).send("");

  const widget = await prisma.widget.create({
    data: {
      name: req.body.name,
      dashboardId: parseInt(req.body.dashboardId),
      query: "",
      type: "metric",
      order: 1,
      options: {},
      createdBy: user.id,
    },
  });

  serverSegment().track({
    userId: user ? user.id : "",
    event: "Added a widget",
    properties: {
      name: req.body.name,
    },
  });

  return res.json(
    ApiResponse.withData(pick(widget, ["id"]), {
      message: "Widget created",
    })
  );
}

export default withMiddlewares(handler, {
  middlewares: [
    [IsSignedIn, {}],
  ],
});

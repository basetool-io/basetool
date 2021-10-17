import { OrganizationUser, User } from "@prisma/client";
import { getUserFromRequest } from "@/features/api";
import { pick } from "lodash";
import { serverSegment } from "@/lib/track";
import { withMiddlewares } from "@/features/api/middleware";
import ApiResponse from "@/features/api/ApiResponse";
import IsSignedIn from "../../../../../features/api/middlewares/IsSignedIn";
import prisma from "@/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  switch (req.method) {
    case "GET":
      return handleGET(req, res);
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

  const view = await prisma.view.create({
    data: {
      name: req.body.name,
      public: req.body.public,
      createdBy: user.id,
      organizationId: organizationId,
      dataSourceId: parseInt(req.body.dataSourceId as string),
      tableName: req.body.tableName,
    },
  });

  serverSegment().track({
    userId: user ? user.id : "",
    event: "Added view",
    properties: {
      name: req.body.name,
      table: req.body.tableName,
    },
  });

  return res.json(
    ApiResponse.withData(pick(view, ["id"]), {
      message: "View created",
    })
  );
}

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  const views = await prisma.view.findMany({
    where: {
      dataSourceId: parseInt(req.query.dataSourceId as string),
    },
    orderBy: [
      {
        createdAt: "asc",
      },
    ],
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

  res.json(ApiResponse.withData(views));
}

export default withMiddlewares(handler, {
  middlewares: [[IsSignedIn, {}]],
});

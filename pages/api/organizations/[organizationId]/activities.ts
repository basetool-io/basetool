import { Activity, DataSource, Organization, User, View } from "@prisma/client";
import { withMiddlewares } from "@/features/api/middleware";
import ApiResponse from "@/features/api/ApiResponse";
import BelongsToOrganization from "@/features/api/middlewares/BelongsToOrganization";
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
  const skip =
    req.query.page && req.query.perPage
      ? (parseInt(req.query.page as string, 10) - 1) *
        parseInt(req.query.perPage as string, 10)
      : 0;

  const take = req.query.perPage
    ? parseInt(req.query.perPage as string, 10)
    : 10;

  const response = (await prisma.organization.findFirst({
    where: {
      id: parseInt(
        (req.query.organizationId || req.body.organizationId) as string,
        10
      ),
    },
    select: {
      activities: {
        select: {
          id: true,
          recordId: true,
          tableName: true,
          dataSource: {
            select: {
              id: true,
              name: true,
            },
          },
          view: {
            select: {
              id: true,
              tableName: true,
              dataSourceId: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          organizationId: true,
          action: true,
          changes: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take,
      },
    },
  })) as Organization & {
    activities: Array<
      Activity & { dataSource?: DataSource; view?: View; user: User }
    >;
  };

  const activitiesCount = await prisma.activity.count({
    where: {
      organizationId: parseInt(
        (req.query.organizationId || req.body.organizationId) as string,
        10
      ),
    },
  });

  res.json(
    ApiResponse.withData(response?.activities || [], {
      meta: { count: activitiesCount },
    })
  );
}

export default withMiddlewares(handler, {
  middlewares: [
    [IsSignedIn, {}],
    [BelongsToOrganization, {}],
  ],
});

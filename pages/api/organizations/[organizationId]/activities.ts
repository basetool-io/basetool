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
  const response = await prisma.organization.findFirst({
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
            }
          },
          view: {
            select: {
              id: true,
              tableName: true,
              dataSourceId: true,
            }
          },
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            }
          },
          organizationId: true,
          action: true,
          changes: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  }) as Organization & {
    activities: Array<
      Activity & { dataSource?: DataSource; view?: View; user: User }
    >;
  };

  res.json(ApiResponse.withData(response?.activities || []));
}

export default withMiddlewares(handler, {
  middlewares: [
    [IsSignedIn, {}],
    [BelongsToOrganization, {}],
  ],
});

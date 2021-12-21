import {
  Dashboard,
  Organization,
  OrganizationUser,
  User,
} from "@prisma/client";
import { flatten, get, parseInt, pick } from "lodash";
import { getUserFromRequest } from "@/features/api";
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

  if (!req.body.name || !req.body.dataSourceId) return res.status(404).send("");

  const dashboard = await prisma.dashboard.create({
    data: {
      name: req.body.name,
      isPublic: true,
      createdBy: user.id,
      organizationId: organizationId,
      dataSourceId: parseInt(req.body.dataSourceId),
    },
  });

  serverSegment().track({
    userId: user ? user.id : "",
    event: "Added a dashboard",
    properties: {
      name: req.body.name,
      email: user?.email,
    },
  });

  return res.json(
    ApiResponse.withData(pick(dashboard, ["id"]), {
      message: "Dashboard created",
    })
  );
}

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  const user = (await getUserFromRequest(req, {
    select: {
      id: true,
      organizations: {
        include: {
          organization: {
            include: {
              dashboards: {
                where: {
                  dataSourceId: parseInt(req.query.dataSourceId as string),
                },
                select: {
                  id: true,
                  name: true,
                  createdBy: true,
                  organizationId: true,
                  isPublic: true,
                  createdAt: true,
                  updatedAt: true,
                  dataSourceId: true,
                },
                orderBy: [
                  {
                    createdAt: "desc",
                  },
                ],
              },
            },
          },
        },
      },
    },
  })) as User & {
    organizations: Array<
      OrganizationUser & {
        organization: Organization & {
          dashboards: Dashboard[];
        };
      }
    >;
  };

  const dashboards = flatten(
    get(user, ["organizations"])
      .map((orgUser) => orgUser?.organization)
      .map((org) => org?.dashboards)
  );

  res.json(ApiResponse.withData(dashboards));
}

export default withMiddlewares(handler, {
  middlewares: [[IsSignedIn, {}]],
});

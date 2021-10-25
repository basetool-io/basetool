import { OrganizationUser, User } from "@prisma/client";
import { getUserFromRequest } from "@/features/api";
import { pick } from "lodash";
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

  const favourite = await prisma.favouriteItem.create({
    data: {
      name: req.body.name,
      url: req.body.url,
      userId: user.id,
    },
  });

  return res.json(
    ApiResponse.withData(pick(favourite, ["id"]), {
      message: "Favourite created",
    })
  );
}

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
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

  if (!user) return res.status(404).send("");

  const views = await prisma.favouriteItem.findMany({
    where: {
      userId: user.id,
    },
    orderBy: [
      {
        createdAt: "asc",
      },
    ],
    select: {
      id: true,
      name: true,
      url: true,
      userId: true,
    },
  });

  res.json(ApiResponse.withData(views));
}

export default withMiddlewares(handler, {
  middlewares: [[IsSignedIn, {}]],
});

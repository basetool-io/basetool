import { OWNER_ROLE } from "@/features/roles";
import { getUserFromRequest } from "@/features/api";
import { serverSegment } from "@/lib/track";
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
    case "PUT":
      return handlePUT(req, res);
    case "DELETE":
      return handleDELETE(req, res);
    default:
      return res.status(404).send("");
  }
};

async function handlePUT(req: NextApiRequest, res: NextApiResponse) {
  const data = {
    roleId: parseInt(req.body.roleId as string),
  };

  const user = await getUserFromRequest(req);

  const result = await prisma.organizationUser.update({
    where: {
      id: parseInt(req.query.organizationUserId as string, 10),
    },
    data,
  });

  serverSegment().track({
    userId: user ? user.id : "",
    event: "Updated organization user",
    properties: {
      organizationUserId: req.query.organizationUserId,
    },
  });

  return res.json(ApiResponse.withData(result, { message: "Updated" }));
}

async function handleDELETE(req: NextApiRequest, res: NextApiResponse) {
  const organizationUser = await prisma.organizationUser.findUnique({
    where: {
      id: parseInt(req.query.organizationUserId as string, 10),
    },
    select: {
      user: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!organizationUser)
    return res.send(ApiResponse.withError("Invalid user."));

  // Get the owner role
  const ownerRoles = await prisma.role.findMany({
    where: {
      name: OWNER_ROLE,
      organizationId: parseInt(req.query.organizationId as string),
    },
  });
  const ownerRoleId = ownerRoles[0].id;
  // remove the organization user that is not an owner
  const response = await prisma.organizationUser.deleteMany({
    where: {
      AND: {
        id: parseInt(req.query.organizationUserId as string, 10),
        NOT: {
          id: ownerRoleId,
        },
      },
    },
  });

  const user = await getUserFromRequest(req);

  serverSegment().track({
    userId: user ? user.id : "",
    event: "Updated organization user",
    properties: {
      organizationUserId: req.query.organizationUserId,
    },
  });

  if (response) {
    return res.json(ApiResponse.withMessage("Removed."));
  }

  return res.json(
    ApiResponse.withMessage("Something went wrong with the removal.")
  );
}

export default withMiddlewares(handler, {
  middlewares: [
    [IsSignedIn, {}],
    [BelongsToOrganization, {}],
  ],
});

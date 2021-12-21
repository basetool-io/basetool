import { OWNER_ROLE } from "@/features/roles";
import { getUserFromRequest } from "@/features/api";
import { pick } from "lodash";
import { schema } from "@/features/roles/schema";
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
  const data = pick(req.body.changes, ["name", "options"]);

  const validator = schema.validate(data, { abortEarly: false });

  if (validator.error) {
    return res.json(ApiResponse.withValidation(validator));
  }

  const user = await getUserFromRequest(req);

  const result = await prisma.role.update({
    where: {
      id: parseInt(req.query.roleId as string, 10),
    },
    data,
  });

  serverSegment().track({
    userId: user ? user.id : "",
    email: user ? user?.email : "",
    event: "Updated organization role",
    properties: {
      roleId: req.query.roleId,
    },
  });

  return res.json(ApiResponse.withData(result, { message: "Updated" }));
}

async function handleDELETE(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromRequest(req);
  await prisma.role.deleteMany({
    where: {
      AND: {
        id: parseInt(req.query.roleId as string, 10),
        NOT: {
          name: OWNER_ROLE,
        },
      },
    },
  });

  serverSegment().track({
    userId: user ? user.id : "",
    email: user ? user?.email : "",
    event: "Deleted organization role",
    properties: {
      roleId: req.query.roleId,
    },
  });

  return res.json(ApiResponse.withMessage("Removed."));
}

export default withMiddlewares(handler, {
  middlewares: [
    [IsSignedIn, {}],
    [BelongsToOrganization, {}],
  ],
});

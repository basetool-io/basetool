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
    case "GET":
      return handleGET(req, res);
    case "PUT":
      return handlePUT(req, res);
    case "POST":
      return handlePOST(req, res);
    default:
      return res.status(404).send("");
  }
};

async function handlePUT(req: NextApiRequest, res: NextApiResponse) {
  const data = pick(req.body, ["name", "options"]);

  const validator = schema.validate(data, { abortEarly: false });
  if (validator.error) {
    return res.json(ApiResponse.withValidation(validator));
  }

  const user = await getUserFromRequest(req);

  const result = await prisma.role.update({
    where: {
      id: parseInt(req.query.id as string, 10),
    },
    data,
  });

  serverSegment().track({
    userId: user ? user.id : "",
    email: user ? user?.email : "",
    event: "Updated role",
    properties: {
      roleId: req.query.id,
    },
  });

  return res.json(ApiResponse.withData(result, { message: "Updated" }));
}

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  const response = await prisma.organization.findFirst({
    where: {
      id: parseInt(
        (req.query.organizationId || req.body.organizationId) as string,
        10
      ),
    },
    select: {
      roles: {
        select: {
          id: true,
          name: true,
          options: true,
        },
      },
    },
  });

  res.json(ApiResponse.withData(response?.roles || []));
}

async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
  const validator = schema.validate(req.body.changes, { abortEarly: false });

  if (validator.error) {
    return res.json(ApiResponse.withValidation(validator));
  }

  const existingRole = await prisma.role.findMany({
    where: {
      name: req.body.changes.name,
      organizationId: parseInt(req.query.organizationId as string),
    },
  });

  if (existingRole.length > 0)
    return res.send(ApiResponse.withMessage("Role already exists."));

  const role = await prisma.role.create({
    data: {
      ...req.body.changes,
      organizationId: parseInt(req.query.organizationId as string),
    },
  });

  const user = await getUserFromRequest(req);

  serverSegment().track({
    userId: user ? user.id : "",
    email: user ? user?.email : "",
    event: "Created role",
    properties: {
      organizationId: req.query.organizationId,
    },
  });

  return res.json(ApiResponse.withData(role, { message: "Created" }));
}

export default withMiddlewares(handler, {
  middlewares: [
    [IsSignedIn, {}],
    [BelongsToOrganization, {}],
  ],
});

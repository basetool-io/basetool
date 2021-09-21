import { OWNER_ROLE } from "@/features/roles"
import { pick } from "lodash"
import { schema } from "@/features/roles/schema";
import { withSentry } from "@sentry/nextjs";
import ApiResponse from "@/features/api/ApiResponse";
import BelongsToOrganization from "@/features/api/middlewares/BelongsToOrganization"
import IsSignedIn from "@/features/api/middlewares/IsSignedIn";
import prisma from "@/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

const handle = async (
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
  const data = pick(req.body.changes, ['name', 'options']);

  const validator = schema.validate(data, { abortEarly: false });

  if (validator.error) {
    return res.json(ApiResponse.withValidation(validator));
  }

  const result = await prisma.role.update({
    where: {
      id: parseInt(req.query.roleId as string, 10),
    },
    data,
  });

  return res.json(ApiResponse.withData(result, { message: "Updated" }));
}

async function handleDELETE(req: NextApiRequest, res: NextApiResponse) {
  await prisma.role.deleteMany({
    where: {
      AND: {
        id: parseInt(req.query.roleId as string, 10),
        NOT: {
          name: OWNER_ROLE
        }
      }
    },
  });

  return res.json(ApiResponse.withMessage("Removed."));
}

export default withSentry(IsSignedIn(BelongsToOrganization(handle)));

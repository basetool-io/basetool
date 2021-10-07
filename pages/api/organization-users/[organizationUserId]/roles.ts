import { getUserFromRequest } from "@/features/api";
import { serverSegment } from "@/lib/track";
import { withMiddlewares } from "@/features/api/middleware";
import ApiResponse from "@/features/api/ApiResponse";
import IsSignedIn from "@/features/api/middlewares/IsSignedIn";
import Joi from "joi";
import OwnsDataSource from "@/features/api/middlewares/OwnsDataSource";
import prisma from "@/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export const schema = Joi.object({
  email: Joi.string().email().required(),
  roleId: Joi.number().required(),
});

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  switch (req.method) {
    case "PUT":
      return handlePUT(req, res);
    default:
      return res.status(404).send("");
  }
};

async function handlePUT(req: NextApiRequest, res: NextApiResponse) {
  const data = req.body;

  if (schema) {
    const validator = schema.validate(data, { abortEarly: false });

    if (validator.error) {
      return res.json(ApiResponse.withValidation(validator));
    }
  }

  const user = await getUserFromRequest(req);

  const result = await prisma.organizationUser.update({
    where: {
      id: parseInt(req.query.organizationUserId as string, 10),
    },
    data: data,
  });

  serverSegment().track({
    userId: user ? user.id : "",
    event: "Updated role",
    properties: {
      organizationUserId: req.query.organizationUserId,
    },
  });

  return res.json(ApiResponse.withData(result, { message: "Updated" }));
}

export default withMiddlewares(handler, {
  middlewares: [
    [IsSignedIn, {}],
    [OwnsDataSource, {}],
  ],
});

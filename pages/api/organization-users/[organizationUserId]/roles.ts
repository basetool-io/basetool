import { schema } from "@/features/organization-users/schema"
import { withMiddlewares } from "@/features/api/middleware"
import ApiResponse from "@/features/api/ApiResponse";
import IsSignedIn from "@/features/api/middlewares/IsSignedIn";
import OwnsDataSource from "@/features/api/middlewares/OwnsDataSource";
import prisma from "@/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

const handle = async (
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
  const data = req.body

  if (schema) {
    const validator = schema.validate(data, { abortEarly: false });

    if (validator.error) {
      return res.json(ApiResponse.withValidation(validator));
    }
  }

  const result = await prisma.organizationUser.update({
    where: {
      id: parseInt(req.query.organizationUserId as string, 10),
    },
    data: data,
  });

  return res.json(ApiResponse.withData(result, { message: "Updated" }));
}

export default withMiddlewares(handle, { middlewares: [[IsSignedIn, {}], [OwnsDataSource, {}]] });

import { withSentry } from "@sentry/nextjs";
import ApiResponse from "@/features/api/ApiResponse";
import BelongsToOrganization from "@/features/api/middleware/BelongsToOrganization";
import IsSignedIn from "@/features/api/middleware/IsSignedIn";
import prisma from "@/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

const handle = async (
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
      id: true,
      name: true,
      roles: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  res.json(ApiResponse.withData(response));
}

export default withSentry(IsSignedIn(BelongsToOrganization(handle)));

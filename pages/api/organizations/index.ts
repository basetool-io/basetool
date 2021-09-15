import { Organization, OrganizationUser, User } from "@prisma/client";
import { getUserFromRequest } from "@/features/api";
import { withSentry } from "@sentry/nextjs";
import ApiResponse from "@/features/api/ApiResponse";
import IsSignedIn from "@/features/api/middleware/IsSignedIn";
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
  const user = (await getUserFromRequest(req, {
    include: {
      organizations: {
        include: {
          organization: {
            select: {
              id: true,
              name: true
            }
          },
        },
      },
    },
  })) as User & {
    organizations: Array<OrganizationUser & {organization: Organization}>;
  };

  const organizations = user?.organizations.map(
    ({ organization }) => organization
  );

  res.json(ApiResponse.withData((organizations) || []));
}

export default withSentry(IsSignedIn(handle));

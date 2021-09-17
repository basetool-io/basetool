import { Organization, OrganizationUser, Role, User } from "@prisma/client";
import { getUserFromRequest } from "@/features/api";
import { omit } from "lodash";
import { withSentry } from "@sentry/nextjs";
import ApiResponse from "@/features/api/ApiResponse";
import IsSignedIn from "@/features/api/middlewares/IsSignedIn"
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
    select: {
      email: true,
      firstName: true,
      lastName: true,
      organizations: {
        include: {
          organization: {
            select: {
              id: true,
              name: true
            }
          },
          role: {
            select: {
              name: true,
              options: true,
            },
          },
        },
      },
    },
  })) as User & {
    organizations: Array<OrganizationUser & {organization: Organization, role: Role}>;
  };

  const organizations = user.organizations.map(
    ({ organization }) => organization
  );

  const organization = organizations[0]
  const role = user.organizations[0].role;
  const profile = { user: omit(user, "organizations"), organization, role }

  res.json(ApiResponse.withData((profile) || {}));
}

export default withSentry(IsSignedIn(handle));

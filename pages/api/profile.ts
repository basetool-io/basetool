import { BasetoolApiRequest } from "@/features/api/types";
import { Organization, OrganizationUser, Role, User } from "@prisma/client";
import { getUserFromRequest } from "@/features/api";
import { omit } from "lodash";
import { withMiddlewares } from "@/features/api/middleware";
import ApiResponse from "@/features/api/ApiResponse";
import IsSignedIn from "@/features/api/middlewares/IsSignedIn";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (
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
              name: true,
              slug: true,
              users: {
                select: {
                  id: true,
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                    },
                  },
                  role: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
              dataSources: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
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
    organizations: Array<
      OrganizationUser & { organization: Organization; role: Role }
    >;
  };

  const organizations = user.organizations.map(
    ({ organization }) => organization
  );

  const subdomain = (req as BasetoolApiRequest).subdomain;
  const organization = organizations.find((org) => org.slug === subdomain);
  const role = user.organizations[0].role;
  const profile = {
    user: omit(user, "organizations"),
    organization,
    organizations,
    role,
  };

  res.json(ApiResponse.withData(profile));
}

export default withMiddlewares(handler, { middlewares: [[IsSignedIn, {}]] });

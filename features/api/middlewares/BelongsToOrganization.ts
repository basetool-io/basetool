import { BasetoolApiRequest } from "../types";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { Organization, Role, User } from "@prisma/client";
import { getUserFromRequest } from "..";

// Try and find an organization with that slug and a role for the current user on that organization
// If we can't find any, we return 404
const BelongsToOrganization =
  (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    const subdomain = (req as BasetoolApiRequest).subdomain;

    // By default we won't allow all requests without an organization
    if (!subdomain) return res.status(404).send("");

    const user = (await getUserFromRequest(req, {
      select: {
        organizations: {
          include: {
            organization: {
              select: {
                name: true,
                slug: true,
              },
            },
            role: true,
          },
        },
      },
    })) as User & {
      organizations: Array<{
        organization: Organization;
        role: Role;
      }>;
    };

    // Check that the user belongs to the organization
    const organizationPivot = user.organizations.find(
      (org) => org.organization.slug === subdomain
    );
    const foundOrg = organizationPivot?.organization;
    const role = organizationPivot?.role;

    // If no organization or role found out, return 404
    if (!foundOrg || !role) return res.status(404).send("");

    return handler(req, res);
  };

export default BelongsToOrganization;

import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { OrganizationUser, User } from "@prisma/client";
import { getUserFromRequest } from "@/features/api";
import isUndefined from "lodash/isUndefined";

const BelongsToOrganization =
  (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    const user = (await getUserFromRequest(req, {
      include: {
        organizations: true,
      },
    })) as User & {
      organizations: OrganizationUser[];
    };

    // Check that the organizationId is in the users organizations
    const foundOrg = user?.organizations?.find(
      (org) =>
        org.organizationId ===
        parseInt(
          (req.query.organizationId || req.body.organizationId) as string
        )
    );
    if (isUndefined(foundOrg)) return res.status(404).send("");

    return handler(req, res);
  };

export default BelongsToOrganization;

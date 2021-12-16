import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { User } from "@prisma/client";
import { getDashboardFromRequest, getUserFromRequest } from "..";

const HasAccessToDashboard =
  (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    const dashboard = await getDashboardFromRequest(req);

    if (!dashboard) {
      return res.status(404).send("");
    }

    const user = (await getUserFromRequest(req, {
      select: {
        id: true,
        organizations: {
          select: {
            organizationId: true,
          },
        },
      },
    })) as User & {
      organizations: {
        organizationId: number;
      }[];
    };

    const organizationIds = user.organizations.map(
      ({ organizationId }) => organizationId
    );

    if (!organizationIds.includes(dashboard?.organizationId)) {
      return res.status(404).send("");
    }

    return handler(req, res);
  };

export default HasAccessToDashboard;

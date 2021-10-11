import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { User } from "@prisma/client";
import { getDataSourceFromRequest, getUserFromRequest } from "@/features/api";

const OwnsDataSource =
  (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    const user = (await getUserFromRequest(req, {
      include: {
        organizations: {
          select: {
            organizationId: true,
          },
        },
      },
    })) as User & {
      organizations: { organizationId: number }[];
    };
    const dataSource = await getDataSourceFromRequest(req);

    if (
      dataSource?.organizationId &&
      user &&
      user.organizations &&
      // if data source organization is in one of the user's organization
      user.organizations.map(({ organizationId }) => organizationId).includes(dataSource.organizationId)
    ) {
      return handler(req, res);
    }

    return res.status(404).send("");
  };

export default OwnsDataSource;

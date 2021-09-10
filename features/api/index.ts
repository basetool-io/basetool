import { DataSource, Organization, User } from "@prisma/client";
import { NextApiRequest } from "next";
import { getSession } from "next-auth/client";
import prisma from "@/prisma";

export const getDataSourceFromRequest = async (
  req: NextApiRequest
): Promise<DataSource | null> =>
  prisma.dataSource.findFirst({
    where: {
      id: parseInt(
        (req.query.dataSourceId || req.body.dataSourceId) as string,
        10
      ),
    },
  });

export const getOrganizationFromRequest = async (
  req: NextApiRequest
): Promise<Organization | null> =>
  prisma.organization.findFirst({
    where: {
      id: parseInt(
        (req.query.organizationId || req.body.organizationId) as string,
        10
      ),
    },
  });

export const getUserFromRequest = async (
  req: NextApiRequest,
  options: Record<string, unknown> = {}
): Promise<User | undefined | null> => {
  const session = await getSession({ req });

  if (!session?.user?.email) return;

  return prisma.user.findFirst({
    where: {
      email: session.user.email,
    },
    ...options,
  });
};

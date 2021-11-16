import { DataSource, Organization, User, View } from "@prisma/client";
import { NextApiRequest } from "next";
import { getSession } from "next-auth/client";
import prisma from "@/prisma";

export const getDataSourceFromRequest = async (
  req: NextApiRequest,
  options: Record<string, unknown> = {}
): Promise<DataSource | null> => {
  let dataSourceIdFromView: string | undefined = undefined;
  if (req.query.viewId) {
    const view = await prisma.view.findFirst({
      where: {
        id: parseInt(req.query.viewId as string, 10),
      },
      select: {
        dataSourceId: true,
      },
    });

    if (view) {
      dataSourceIdFromView = view.dataSourceId.toString();
    }
  }

  return await prisma.dataSource.findFirst({
    where: {
      id: parseInt(
        (req.query.dataSourceId ||
          req.body.dataSourceId ||
          dataSourceIdFromView) as string,
        10
      ),
    },
    ...options,
  });
};

export const getOrganizationFromRequest = async (
  req: NextApiRequest,
  options: Record<string, unknown> = {}
): Promise<Organization | null> =>
  prisma.organization.findFirst({
    where: {
      id: parseInt(
        (req.query.organizationId || req.body.organizationId) as string,
        10
      ),
    },
    ...options,
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

export const getViewFromRequest = async (
  req: NextApiRequest,
  options: Record<string, unknown> = {}
): Promise<View | null> => {
  return await prisma.view.findUnique({
    where: {
      id: parseInt((req.query.viewId || req.body.viewId) as string),
    },
    ...options,
  });
};

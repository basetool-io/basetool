import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function seed(options: {user?: {email: string, password: string}}) {
  const email = options?.user?.email || 'ted@afc.richmond'
  const password = options?.user?.password || process.env.SEED_PASSWORD

  await prisma.dataSource.deleteMany({});
  await prisma.organizationUser.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.organization.deleteMany({});

  const organization = await prisma.organization.create({
    data: {
      name: "AFC Richmond",
      slug: "afc-richmond",
    },
  });

  const data: {
    email: string;
    firstName: string;
    lastName: string;
    password?: string;
  } = {
    email: email,
    firstName: "Ted",
    lastName: "Lasso",
  };

  if (password) {
    data.password = await hashPassword(password);
  }

  const user = await prisma.user.create({
    data,
  });

  await prisma.organizationUser.create({
    data: {
      organizationId: organization.id,
      userId: user.id,
      role: "admin",
    },
  });
}

export const hashPassword = async (password: string) => {
  const salt = bcrypt.genSaltSync(10);

  return await bcrypt.hashSync(password, salt);
};

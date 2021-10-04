import { PrismaClient } from "@prisma/client";
import { encrypt } from "./../lib/crypto";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function seed(options?: {
  user?: { email: string; password: string };
}) {
  const email = options?.user?.email || "ted.lasso@apple.com";
  const password = options?.user?.password || process.env.SEED_PASSWORD;

  await prisma.dataSource.deleteMany({});
  await prisma.organizationUser.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.organization.deleteMany({});

  const organization = await prisma.organization.create({
    data: {
      name: "Apple",
      slug: "apple",
      roles: {
        create: [
          {
            name: "Owner",
          },
          {
            name: "Member",
          },
        ],
      },
    },
    include: {
      roles: true,
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

  // Owner user
  await prisma.organizationUser.create({
    data: {
      organizationId: organization.id,
      userId: user.id,
      roleId: organization.roles[0].id,
    },
  });

  const roy = await prisma.user.create({
    data: {
      email: "roy.kent@apple.com",
      firstName: "Roy",
      lastName: "Kent",
    },
  });

  // Member user
  await prisma.organizationUser.create({
    data: {
      organizationId: organization.id,
      userId: roy.id,
      roleId: organization.roles[1].id,
    },
  });

  return { user, organization };
}

export const seedDataSource = async ({
  name = "Avo Demo",
  type = "postgresql",
  organizationId = 1,
  credentials = {
    useSsl: false,
    url: process.env.DATABASE_TEST_CREDENTIALS,
  },
}) => {
  const encryptedCredentials = encrypt(JSON.stringify(credentials));
  const dataSource = await prisma.dataSource.create({
    data: {
      name: name,
      type: type,
      encryptedCredentials,
      organizationId,
    },
  });

  return dataSource;
};

export const hashPassword = async (password: string) => {
  const salt = bcrypt.genSaltSync(10);

  return await bcrypt.hashSync(password, salt);
};

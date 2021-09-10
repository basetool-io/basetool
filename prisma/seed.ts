import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  await prisma.dataSource.deleteMany({});
  await prisma.organizationUser.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.organization.deleteMany({});

  const organization = await prisma.organization.create({
    data: {
      name: "AFC Richmond",
      slug: "afc-richmond",
      roles: {
        create: [
          {
            name: 'Owner',
          },
          {
            name: 'Member',
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
    email: "ted@afc.richmond",
    firstName: "Ted",
    lastName: "Lasso",
  };

  if (process.env.SEED_PASSWORD) {
    data.password = await hashPassword(process.env.SEED_PASSWORD);
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
      email: "roy@afc.richmond",
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
}

export const hashPassword = async (password: string) => {
  const salt = bcrypt.genSaltSync(10);

  return await bcrypt.hashSync(password, salt);
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

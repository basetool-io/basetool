import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.dataSource.deleteMany({});
  await prisma.organizationUser.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.organization.deleteMany({});

  const organization = await prisma.organization.create({
    data: {
      name: "Apple",
      slug: "apple",
    },
  });

  const user = await prisma.user.create({
    data: {
      email: "adrian@basetool.io",
      firstName: "Adrian",
      lastName: "Marin",
    },
  });

  await prisma.organizationUser.create({
    data: {
      organizationId: organization.id,
      userId: user.id,
      role: 'admin',
    },
  });

  const dataSource = await prisma.dataSource.create({
    data: {
      name: "First Data Source",
      type: "postgresql",
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

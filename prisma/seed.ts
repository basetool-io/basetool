import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { seed } from "./seed-script"

const prisma = new PrismaClient();

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

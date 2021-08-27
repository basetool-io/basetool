import { OrganizationUser, User } from "@prisma/client";
import bcrypt from "bcrypt";
import prisma from "@/prisma";

export const createUser = async (data: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<
  | (User & {
      organizations: OrganizationUser[];
    })
  | undefined
> => {
  const { email, firstName, lastName, password } = data;

  if (!email) return;

  let organization;

  let user = await prisma.user.findFirst({
    where: {
      email,
    },
    include: {
      organizations: true,
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        password,
        firstName,
        lastName,
      },
      include: {
        organizations: true,
      },
    });
  }

  // Create an organization if it's missing
  if (user && user.organizations && user.organizations.length <= 0) {
    organization = await prisma.organization.create({
      data: {
        name: "Acme Inc",
        slug: randomString(),
        users: {
          create: {
            userId: user.id,
            role: "admin",
          },
        },
      },
    });
  } else {
    await prisma.user.findFirst({
      where: {
        email,
      },
      include: {
        organizations: true,
      },
    });
  }

  return user;
};

export const randomString = (length = 12) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

export const hashPassword = async (password: string) => {
  const salt = bcrypt.genSaltSync(10);

  return await bcrypt.hashSync(password, salt);
}

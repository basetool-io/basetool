import { MEMBER_ROLE, OWNER_ROLE } from "../roles";
import { OrganizationUser, User } from "@prisma/client";
import { randomString } from "@/lib/helpers"
import bcrypt from "bcrypt";
import prisma from "@/prisma";
import slugify from "slugify";

export const createUser = async (data: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  organization: string;
}): Promise<
  | (User & {
      organizations: OrganizationUser[];
    })
  | undefined
> => {
  const { email, firstName, lastName, password, organization } = data;

  if (!email) return;

  let createdOrganization;

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
    const sluggifedOrgName = slugify(organization);
    let slug = sluggifedOrgName
    let foundASlug = false

    // We're going to try 20 times to generate a slug.
    for (let slugTry = 1; slugTry <= 20; slugTry++) {
      const slugOrg = await prisma.organization.findFirst({
        where: {
          slug,
        },
      });
      // If there's an org. with that slug, try another slug
      if (slugOrg) {
        slug = `${sluggifedOrgName}-${slugTry}`
      } else {
        foundASlug = true
        break;
      }
    }

    createdOrganization = await prisma.organization.create({
      data: {
        name: organization || "Acme Inc",
        slug: foundASlug ? slug : randomString(),
        users: {
          create: {
            userId: user.id,
          },
        },
        roles: {
          create: [
            {
              name: OWNER_ROLE,
            },
            { name: MEMBER_ROLE },
          ],
        },
      },
      include: {
        roles: true,
      },
    });

    // assign the role of Admin to that first user
    const role = createdOrganization.roles[0];
    await prisma.organizationUser.updateMany({
      where: {
        userId: user.id,
      },
      data: {
        roleId: role.id,
      },
    });
  }

  return user;
};

export const hashPassword = async (password: string) => {
  const salt = bcrypt.genSaltSync(10);

  return await bcrypt.hashSync(password, salt);
};

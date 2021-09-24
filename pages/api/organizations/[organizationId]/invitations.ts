import { OWNER_ROLE } from "@/features/roles";
import { baseUrl } from "@/features/api/urls";
import { hashPassword } from "@/features/auth";
import { schema } from "@/features/organizations/invitationsSchema";
import { withMiddlewares } from "@/features/api/middleware";
import ApiResponse from "@/features/api/ApiResponse";
import mailgun from "@/lib/mailgun";
import prisma from "@/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  switch (req.method) {
    case "POST":
      return handlePOST(req, res);
    default:
      return res.status(404).send("");
  }
};

async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
  const validator = schema.validate(req.body.changes, { abortEarly: false });

  if (validator.error) {
    return res.json(ApiResponse.withValidation(validator));
  }

  const invitation = await prisma.organizationInvitation.findFirst({
    where: {
      uuid: req.body.uuid,
    },
    select: {
      uuid: true,
      organizationUser: {
        select: {
          organization: true,
          user: true,
        },
      },
    },
  });

  if (!invitation)
    return res.send(ApiResponse.withMessage("Invalid invitation."));

  const { organizationUser } = invitation;
  const { user, organization } = organizationUser;

  // Update the user with new info
  const newUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      firstName: req.body.formData.firstName,
      lastName: req.body.formData.lastName,
      password: await hashPassword(req.body.formData.password),
    },
  });

  if (!newUser.id)
    return res.json(ApiResponse.withError("Failed to update your info."));

  const org = await prisma.organization.findUnique({
    where: {
      id: organization.id,
    },
    select: {
      slug: true,
      roles: {
        where: {
          name: OWNER_ROLE,
        },
        select: {
          organizationUsers: {
            select: {
              user: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      },
    },
  });

  try {
    const owner = org?.roles[0]?.organizationUsers[0].user;

    // Send email to owner
    mailgun.send({
      to: owner?.email as string,
      subject: "Good news from Basetool",
      text: `${req.body.formData.firstName} ${req.body.formData.lastName} has accepted your invitation to Basetool.`,
      html: `${req.body.formData.firstName} ${req.body.formData.lastName} has accepted your invitation to <a href="${baseUrl}/organizations/${org?.slug}">Basetool</a>.`,
    });
  } catch (error) {
    console.log("error->", error);
  }

  await prisma.organizationInvitation.delete({
    where: {
      uuid: req.body.uuid,
    },
  });

  return res.json(ApiResponse.withMessage("You are in!"));
}

export default withMiddlewares(handler);

import { OWNER_ROLE } from "@/features/roles";
import { baseUrl } from "@/features/api/urls";
import { captureMessage } from "@sentry/nextjs";
import { hashPassword } from "@/features/auth";
import { isNull } from "lodash"
import { schema } from "@/features/organizations/invitationsSchema";
import { v4 as uuidv4 } from "uuid";
import { withMiddlewares } from "@/features/api/middleware";
import ApiResponse from "@/features/api/ApiResponse";
import BasetoolError from "@/lib/BasetoolError"
import Joi from "joi";
import mailgun from "@/lib/mailgun";
import prisma from "@/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  switch (req.method) {
    case "PUT":
      return handlePUT(req, res);
    case "POST":
      return handlePOST(req, res);
    default:
      return res.status(404).send("");
  }
};

async function handlePUT(req: NextApiRequest, res: NextApiResponse) {
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
    await mailgun.send({
      to: owner?.email as string,
      subject: "Good news from Basetool",
      text: `${req.body.formData.firstName} ${req.body.formData.lastName} has accepted your invitation to Basetool.`,
      html: `${req.body.formData.firstName} ${req.body.formData.lastName} has accepted your invitation to <a href="${baseUrl}/organizations/${org?.slug}">Basetool</a>.`,
    });
  } catch (error: any) {
    captureMessage(`Failed to send email ${error.message}`);
  }

  await prisma.organizationInvitation.delete({
    where: {
      uuid: req.body.uuid,
    },
  });

  return res.json(ApiResponse.withMessage("You are in!"));
}

async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    roleId: Joi.number().required(),
  });

  const validator = schema.validate(req.body, { abortEarly: false });

  if (validator.error) {
    return res.json(ApiResponse.withValidation(validator));
  }

  // Try to find a user in our DB by that email
  let user = await prisma.user.findFirst({
    where: {
      email: req.body.email,
    },
    select: {
      id: true,
      email: true,
    },
  });

  // Get that role
  const existingRole = await prisma.role.findFirst({
    where: {
      id: req.body.roleId,
      organizationId: parseInt(req.query.organizationId as string),
    },
    select: {
      organization: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!existingRole)
    return res.send(ApiResponse.withMessage("Role does not exists."));

  const organization = existingRole.organization;
  const uuid = uuidv4();
  const newUser = isNull(user)

  if (newUser) {
    // create an account for the user
    user = await prisma.user.create({
      data: {
        email: req.body.email,
      },
      select: {
        id: true,
        email: true,
      },
    });
  }

  if (!user) throw new BasetoolError('Failed to create the user.')

  try {
    const organizationUser = await prisma.organizationUser.create({
      data: {
        userId: user.id,
        roleId: req.body.roleId,
        organizationId: parseInt(req.query.organizationId as string),
      },
      select: {
        id: true,
        userId: true,
        roleId: true,
        organizationId: true,
      },
    });

    const emailData: any = {
      to: req.body.email,
      subject: `🤫 You have been invited to join ${organization.name} on Basetool.io`,
    }

    if (newUser) {
      const invite = await prisma.organizationInvitation.create({
        data: {
          organizationUserId: organizationUser.id,
          uuid: uuid,
        },
        select: {
          uuid: true,
        },
      });
      // send email to the invited person
      emailData.inviteUrl = `${baseUrl}/organization-invitations/${uuid}`;
      emailData.text = `Please use the link below to join. \n ${emailData.inviteUrl}`
      emailData.html = `Please click <a href="${emailData.inviteUrl}">here</a> to join. <br /> ${emailData.inviteUrl}`
    } else {
      emailData.inviteUrl = `${baseUrl}/organizations/${organization.slug}`;
      emailData.text = `Please use the link below to join. \n ${emailData.inviteUrl}`
      emailData.html = `Please click <a href="${emailData.inviteUrl}">here</a> to join. <br /> ${emailData.inviteUrl}`
    }

    try {
      await mailgun.send(emailData);
    } catch (error: any) {
      captureMessage(`Failed to send email ${error.message}`);
    }

    return res.json(
      ApiResponse.withMessage("User invited to join 💪")
    );
  } catch (error: any) {
    return res.send(ApiResponse.withError(error.message, { meta: error }));
  }
}

export default withMiddlewares(handler);

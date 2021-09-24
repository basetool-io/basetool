import { baseUrl } from "@/features/api/urls";
import { v4 as uuidv4 } from "uuid";
import { withMiddlewares } from "@/features/api/middleware"
import ApiResponse from "@/features/api/ApiResponse";
import BelongsToOrganization from "@/features/api/middlewares/BelongsToOrganization";
import IsSignedIn from "@/features/api/middlewares/IsSignedIn";
import Joi from "joi";
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
  const schema = Joi.object({
    email: Joi.string().email().required(),
    roleId: Joi.number().required(),
  });

  const validator = schema.validate(req.body, { abortEarly: false });

  if (validator.error) {
    return res.json(ApiResponse.withValidation(validator));
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      email: req.body.email,
    },
    select: {
      id: true,
      email: true,
    },
  });

  if (existingUser)
    return res.send(ApiResponse.withError("User already exists."));

  const existingRole = await prisma.role.findMany({
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

  if (existingRole.length === 0)
    return res.send(ApiResponse.withMessage("Role does not exists."));
  const organization = existingRole[0].organization;
  const uuid = uuidv4();

  try {
    const user = await prisma.user.create({
      data: {
        email: req.body.email,
      },
      select: {
        id: true,
        email: true,
      },
    });
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
    const inviteUrl = `${baseUrl}/organization-invitations/${uuid}`;
    mailgun.send({
      to: req.body.email,
      subject: `🤫 You have been invited to join ${organization.name} on Basetool.io`,
      text: `Please use the link below to join. \n ${inviteUrl}`,
      html: `Please click <a href="${inviteUrl}">here</a> to join. <br /> ${inviteUrl}`,
    });

    return res.json(
      ApiResponse.withData(
        { user, organizationUser, invite },
        { message: "User invited to join 💪" }
      )
    );
  } catch (error: any) {
    return res.send(ApiResponse.withError(error.message, { meta: error }));
  }
}

export default withMiddlewares(handler, {
  middlewares: [
    [IsSignedIn, {}],
    [BelongsToOrganization, {}],
  ],
});

/* eslint-disable max-len */
// import { Client } from "intercom-client";
import { createUser, hashPassword } from "@/features/auth";
// import { intercomAccessToken } from "@/lib/services";
import { schema } from "@/features/auth/signupSchema";
import { serverSegment } from "@/lib/track";
import { withMiddlewares } from "@/features/api/middleware";
import ApiResponse from "@/features/api/ApiResponse";
import email from "@/lib/email";
import logger from "@/lib/logger";
import prisma from "@/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

const successMessage = "Account created. Please sign in.";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const payload = req.body;
  const validator = schema.validate(payload, { abortEarly: false });

  if (validator.error) {
    return res.json(ApiResponse.withValidation(validator));
  }

  const userPresent = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (userPresent) {
    // Even if the user is already present we want to respond with success to avoid bad actors.
    return res.send(ApiResponse.withMessage(successMessage));
  }

  const { password } = payload;
  const hashedPassword = await hashPassword(password);
  const data = {
    email: payload.email,
    password: hashedPassword,
    firstName: payload.firstName,
    lastName: payload.lastName,
    organization: payload.organization,
    lastKnownTimezone: payload.lastKnownTimezone,
  };

  const user = await createUser(data);

  try {
    serverSegment().track({
      userId: user ? user?.id : "",
      email: user ? user?.email : "",
      event: "User registered",
      properties: {},
    });

    // if (intercomAccessToken) {
    //   const intercomClient = new Client({
    //     token: intercomAccessToken,
    //   });

    //   await intercomClient.contacts.create({
    //     email: payload.email,
    //     user_id: user?.id?.toString(),
    //     name: `${user?.firstName} ${user?.lastName}`,
    //     custom_attributes: {
    //       Organization: payload?.organization,
    //     },
    //     signed_up_at: Date.now() / 1000,
    //   } as any);
    // }

    await email.send({
      to: ["adrian@basetool.io", "david@basetool.io"],
      subject: "New user signup",
      text: `New user with email ${payload.email} and organization ${payload.organization}`,
    });
  } catch (error: any) {
    logger.error({
      msg: `Failed to send registration email.`,
      errorMessage: error.message,
      error,
    });
  }

  return res.json(ApiResponse.withMessage(successMessage));
};

export default withMiddlewares(handler);

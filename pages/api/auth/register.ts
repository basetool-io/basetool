/* eslint-disable max-len */
import { createUser } from "@/features/auth";
import { schema } from "@/features/auth/signupSchema";
import { withSentry } from "@sentry/nextjs";
import ApiResponse from "@/features/api/ApiResponse";
import bcrypt from "bcrypt";
import prisma from "@/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

const successMessage = "Account created. Please sign in.";

const handle = async (
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

  const salt = bcrypt.genSaltSync(10);
  const { password } = payload;
  const hashedPassword = await bcrypt.hashSync(password, salt);
  const data = {
    email: payload.email,
    password: hashedPassword,
    firstName: payload.firstName,
    lastName: payload.lastName,
  };

  await createUser(data);

  return res.json(ApiResponse.withMessage(successMessage));
};

export default withSentry(handle);

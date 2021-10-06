import { withMiddlewares } from "@/features/api/middleware";
import email from "@/lib/email"
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await email.send({
    to: ["adrian@basetool.io", "david@basetool.io"],
    subject: "New user signup",
    text: `New user with email ${'payload.email'} and organization ${'payload.organization'}`,
  });
  res.status(200).json({ name: "John Doe" });
};

export default withMiddlewares(handler);

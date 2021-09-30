// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { seed, seedDataSource } from "@/prisma/seed-script";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (process.env.ENV !== "test") return res.status(404).send("");

  switch (req.method) {
    case "POST":
      return handlePOST(req, res);
    default:
      return res.status(404).send("");
  }
}

async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
  const user = req.body.user;

  // Seed user & organization
  const { organization } = await seed({ user });

  await seedDataSource({
    organizationId: organization.id,
  });

  res.status(200).json({ name: "John Doe" });
}

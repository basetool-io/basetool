import { OrganizationUser, User } from "@prisma/client";
import { encrypt } from "@/lib/crypto";
import { getSession } from "next-auth/client";
import { withMiddlewares } from "@/features/api/middleware";
import ApiResponse from "@/features/api/ApiResponse";
import IsSignedIn from "../../../features/api/middlewares/IsSignedIn";
import getSchema from "@/plugins/data-sources/getSchema";
import prisma from "@/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { pick } from "lodash"

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  switch (req.method) {
    case "GET":
      return handleGET(req, res);
    case "POST":
      return handlePOST(req, res);
    default:
      return res.status(404).send("");
  }
};

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) return res.status(404).send("");

  const user = (await prisma.user.findUnique({
    where: {
      email: session?.user?.email as string,
    },
    include: {
      organizations: {
        include: {
          organization: true,
        },
      },
    },
  })) as User & {
    organizations: OrganizationUser[];
  };

  const { organizations } = user;
  const organizationIds = organizations.map(
    ({ organizationId }) => organizationId
  );

  const dataSources = await prisma.dataSource.findMany({
    where: {
      organizationId: {
        in: organizationIds,
      },
    },
    orderBy: [
      {
        createdAt: "asc",
      },
    ],
  });

  res.json(ApiResponse.withData(dataSources));
}

async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) return res.status(404).send("");

  const schema = await getSchema(req.body.type);
  if (schema) {
    const validator = schema.validate(req.body, { abortEarly: false });

    if (validator.error) {
      return res.json(ApiResponse.withValidation(validator));
    }
  }

  // encrypt the credentials
  const encryptedCredentials = encrypt(JSON.stringify(req.body.credentials));
  const dataSource = await prisma.dataSource.create({
    data: {
      name: req.body.name,
      type: req.body.type,
      encryptedCredentials,
      organizationId: parseInt(req.body.organizationId as string),
    },
  });

  return res.json(
    ApiResponse.withData(pick(dataSource, ['id']), { message: "Data source created" })
  );
}

export default withMiddlewares(handler, {
  middlewares: [[IsSignedIn, {}]],
});

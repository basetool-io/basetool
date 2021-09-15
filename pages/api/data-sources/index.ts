import { OrganizationUser, User } from "@prisma/client"
import { encrypt } from "@/lib/crypto"
import { getSession } from "next-auth/client"
import { withSentry } from "@sentry/nextjs";
import ApiResponse from "@/features/api/ApiResponse";
import IsSignedIn from "../../../features/api/middleware/IsSignedIn"
import getSchema from "@/plugins/data-sources/getSchema"
import prisma from "@/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

const handle = async (
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
  const session = await getSession({ req })

  if (!session) return res.status(404).send('')

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
  const [firstOrganizationPivot] = organizations;
  const organizationId = firstOrganizationPivot.id;

  const dataSources = await prisma.dataSource.findMany({
    where: {
      organizationId
    }
  });

  res.json(ApiResponse.withData(dataSources));
}

async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req })

  if (!session) return res.status(404).send('')

  const schema = await getSchema(req.body.type);
  if (schema) {
    const validator = schema.validate(req.body, { abortEarly: false });

    if (validator.error) {
      return res.json(ApiResponse.withValidation(validator));
    }
  }

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
  const [firstOrganizationPivot] = organizations;
  const organizationId = firstOrganizationPivot.id;

  // encrypt the credentials
  const encryptedCredentials = encrypt(JSON.stringify(req.body.credentials))
  const data = {
    id: req.body.id,
    name: req.body.name,
    type: req.body.type,
    organizationId,
    encryptedCredentials
  }

  const dataSource = await prisma.dataSource.create({
    data,
  });

  return res.json(
    ApiResponse.withData(dataSource, { message: "Data source created" })
  );
}

export default withSentry(IsSignedIn(handle));

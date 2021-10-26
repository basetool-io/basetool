import * as fs from "fs";
import { AnyObject } from "immer/dist/internal";
import { OrganizationUser, User } from "@prisma/client";
import { encrypt } from "@/lib/crypto";
import { getSession } from "next-auth/client";
import { getUserFromRequest } from "@/features/api";
import { pick, sum } from "lodash";
import { s3KeysBucket } from "@/features/data-sources"
import { serverSegment } from "@/lib/track";
import { withMiddlewares } from "@/features/api/middleware";
import ApiResponse from "@/features/api/ApiResponse";
import IsSignedIn from "../../../features/api/middlewares/IsSignedIn";
import S3 from "aws-sdk/clients/s3";
import formidable from "formidable";
import getSchema from "@/plugins/data-sources/getSchema";
import prisma from "@/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

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
    select: {
      id: true,
      name: true,
      organizationId: true,
      type: true,
      options: true,
    },
  });

  res.json(ApiResponse.withData(dataSources));
}

async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
  const user = (await getUserFromRequest(req, {
    select: {
      id: true,
      organizations: {
        include: {
          organization: {
            include: {
              dataSources: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
    },
  })) as User & {
    organizations: {
      organization: {
        dataSources: [];
      };
    }[];
  };

  const form = formidable();
  const { fields, files } = await new Promise((resolve, reject) => {
    return form.parse(req, (error: any, fields: any, files: any) => {
      if (error) reject(error);

      resolve({ fields, files });
    });
  });

  // Parse and assign the credentials
  const type = fields.type;
  const credentials = JSON.parse(fields.credentials);
  const options = JSON.parse(fields.options);
  const ssh = fields.ssh ? JSON.parse(fields.ssh) : {};
  delete ssh.key // remove the file reference
  const body = {
    name: fields.name,
    organizationId: fields.organizationId,
    type,
    credentials,
    ssh,
  };

  const schema = getSchema(type);
  if (schema) {
    const validator = schema.validate(body, { abortEarly: false });

    if (validator.error) {
      return res.json(ApiResponse.withValidation(validator));
    }
  }

  // encrypt the credentials
  const encryptedCredentials = encrypt(JSON.stringify(body.credentials));
  // encrypt the ssh credentials
  const encryptedSSHCredentials = encrypt(JSON.stringify(body.ssh));

  const dataSource = await prisma.dataSource.create({
    data: {
      name: body.name,
      options,
      type,
      encryptedCredentials,
      encryptedSSHCredentials,
      organizationId: parseInt(body.organizationId as string),
    },
  });

  // If we get the key from the client we'll store it in S3
  if (files.key) {
    await storeSSHKey({
      Key: dataSource.id.toString(),
      Body: fs.readFileSync(files.key._writeStream.path),
    });
  }

  const count = sum(
    user?.organizations.map(
      (orgUser: AnyObject) => orgUser.organization.dataSources.length
    )
  );

  serverSegment().track({
    userId: user ? user.id : "",
    event: "Added data source",
    properties: {
      id: type,
      count,
    },
  });

  return res.json(
    ApiResponse.withData(pick(dataSource, ["id"]), {
      message: "Data source created 🚀",
    })
  );
}

export default withMiddlewares(handler, {
  middlewares: [[IsSignedIn, {}]],
});

const storeSSHKey = async ({ Key, Body }: { Key: string; Body: Buffer }) => {
  const S3Client = new S3({
    accessKeyId: process.env.AWS_S3_DS_KEYS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_DS_KEYS_SECRET_ACCESS_KEY,
    region: process.env.AWS_S3_DS_KEYS_REGION,
  });

  const params = {
    Key,
    Body,
    Bucket: s3KeysBucket(),
  };

  return await S3Client.putObject(params).promise();
};

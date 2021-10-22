import { AnyObject } from "immer/dist/internal";
import { OrganizationUser, User } from "@prisma/client";
import { encrypt } from "@/lib/crypto";
import { getSession } from "next-auth/client";
import { getUserFromRequest } from "@/features/api";
import { pick, sum } from "lodash";
import { serverSegment } from "@/lib/track";
import { withMiddlewares } from "@/features/api/middleware";
import ApiResponse from "@/features/api/ApiResponse";
import IsSignedIn from "../../../features/api/middlewares/IsSignedIn";
import getSchema from "@/plugins/data-sources/getSchema";
import prisma from "@/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

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

  const schema = getSchema(req.body.type);
  if (schema) {
    const validator = schema.validate(req.body, { abortEarly: false });

    if (validator.error) {
      return res.json(ApiResponse.withValidation(validator));
    }
  }

  // encrypt the credentials
  const encryptedCredentials = encrypt(JSON.stringify(req.body.credentials));
  // encrypt the ssh credentials
  const encryptedSSHCredentials = encrypt(JSON.stringify(req.body.ssh));

  const dataSource = await prisma.dataSource.create({
    data: {
      name: req.body.name,
      type: req.body.type,
      encryptedCredentials,
      encryptedSSHCredentials,
      organizationId: parseInt(req.body.organizationId as string),
    },
  });

  const count = sum(
    user?.organizations.map(
      (orgUser: AnyObject) => orgUser.organization.dataSources.length
    )
  );

  serverSegment().track({
    userId: user ? user.id : "",
    event: "Added data source",
    properties: {
      id: req.body.type,
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

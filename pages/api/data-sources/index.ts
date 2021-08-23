import { OrganizationUser, User } from "@prisma/client";
import { getSchema } from "@/plugins/data-sources";
import { getSession } from "next-auth/client";
import { withSentry } from "@sentry/nextjs";
import ApiResponse from "@/features/api/ApiResponse";
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
  const dataSources = await prisma.dataSource.findMany({});

  res.json(ApiResponse.withData(dataSources));
}

async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
  // const session = await getSession({ req });
  const data = req.body;

  // if (!session) {
  //   return res.status(404).send("");
  // }

  const schema = getSchema(req.body.type);
  if (schema) {
    const validator = schema.validate(data, { abortEarly: false });

    if (validator.error) {
      return res.json(ApiResponse.withValidation(validator));
    }
  }

  // const user = (await prisma.user.findUnique({
  //   where: {
  //     email: session?.user?.email as string,
  //   },
  //   include: {
  //     organizations: {
  //       include: {
  //         organization: true,
  //       },
  //     },
  //   },
  // })) as User & {
  //   organizations: OrganizationUser[];
  // };

  // const { organizations } = user;
  // const [firstOrganizationPivot] = organizations;
  // const firstOrganizationPivot = 1;
  const organizationId = 1;
  console.log("data->", data);

  const dataSource = await prisma.dataSource.create({
    data: {
      ...data,
      organizationId: organizationId,
    },
  });

  return res.json(
    ApiResponse.withData(dataSource, { message: "Data source created" })
  );
}

export default withSentry(handle);

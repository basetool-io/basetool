// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { GoogleSheetsDataSource } from "@/plugins/data-sources/google-sheets/types";
import { getDataSourceFromRequest, getUserFromRequest } from "@/features/api";
import { serverSegment } from "@/lib/track"
import { withMiddlewares } from "@/features/api/middleware"
import ApiResponse from "@/features/api/ApiResponse";
import GoogleDriveService from "@/plugins/data-sources/google-sheets/GoogleDriveService";
import prisma from "@/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      return handleGET(req, res);
    case "POST":
      return handlePOST(req, res);
    default:
      return res.status(404).send("");
  }
};

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const dataSource = await prisma.dataSource.findUnique({
    where: {
      id: parseInt(req.query.dataSourceId as string),
    },
  });

  if (!dataSource) return res.status(404).send("");

  const api = new GoogleDriveService(dataSource);

  let driveResponse;

  try {
    driveResponse = await api.listSpreadsheets();
  } catch (error: any) {
    return res.send(ApiResponse.withError(error.message));
  }

  if (driveResponse?.files) {
    const files = driveResponse.files.map(({ id, name }) => ({ id, name }));

    res.send(ApiResponse.withData(files));
  } else {
    res.send([]);
  }
};

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const dataSource = (await getDataSourceFromRequest(
    req
  )) as GoogleSheetsDataSource | null;

  if (!dataSource) return res.status(404).send("");

  const user = await getUserFromRequest(req)

  const { spreadsheetId, spreadsheetName } = req.body;

  await prisma.dataSource.update({
    where: {
      id: dataSource.id as number,
    },
    data: {
      name: spreadsheetName,
      options: {
        ...dataSource.options,
        spreadsheetId,
      },
    },
  });

  serverSegment().track({
    userId: user ? user.id : "",
    event: "Created Google Sheets data source",
  });

  return res.send(ApiResponse.withMessage("Updated!"));
};

export default withMiddlewares(handler);

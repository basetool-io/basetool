// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import ApiResponse from "@/features/api/ApiResponse";
import GoogleSheetsService from "@/plugins/data-sources/google-sheets/GoogleSheetsService";
import prisma from "@/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const dataSource = await prisma.dataSource.findUnique({
    where: {
      id: 3,
    },
  });

  // return res.send(dataSource)

  if (!dataSource) return res.status(404).send("");

  const api = new GoogleSheetsService(dataSource);

  return res.send(await api.getSpreadsheet(req.query.spreadsheetId as string));

  await api.loadInfo();

  return res.send("api.doc");
}

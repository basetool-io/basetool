import { getDataSourceFromRequest } from "@/features/api";
import { withSentry } from "@sentry/nextjs";
import ApiResponse from "@/features/api/ApiResponse";
import IsSignedIn from "@/pages/api/middleware/IsSignedIn";
import OwnsDataSource from "@/pages/api/middleware/OwnsDataSource";
import getQueryService from "@/plugins/data-sources/getQueryService";
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
  const dataSource = await getDataSourceFromRequest(req);

  if (!dataSource) return res.status(404).send("");

  const service = await getQueryService({ dataSource });

  await service.connect();

  const records = await service.getRecords(req.query.tableName as string);

  await service.disconnect();

  res.json(ApiResponse.withData(records));
}

async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
  if (!req?.body?.record || Object.keys(req.body.record).length === 0)
    return res.send(ApiResponse.withError("No record sent."));
  const dataSource = await getDataSourceFromRequest(req);

  if (!dataSource) return res.status(404).send("");

  const service = await getQueryService({dataSource});

  await service.connect();

  const { record } = req.body;

  let data;

  try {
    data = await service.createRecord(
      req.query.tableName as string,
      req.query.recordId as string,
      record
    );
  } catch (error) {
    return res.json(ApiResponse.withError(error.message));
  }

  await service.disconnect();

  res.json(ApiResponse.withData({id: data}, { message: "Record added" }));
}

export default withSentry(IsSignedIn(OwnsDataSource(handle)));

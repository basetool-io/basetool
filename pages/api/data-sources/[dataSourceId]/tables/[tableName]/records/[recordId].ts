import { getDataSourceFromRequest } from "@/features/api";
import { withSentry } from "@sentry/nextjs";
import ApiResponse from "@/features/api/ApiResponse";
import IsSignedIn from "@/features/api/middleware/IsSignedIn";
import OwnsDataSource from "@/features/api/middleware/OwnsDataSource";
import getQueryService from "@/plugins/data-sources/getQueryService";
import type { NextApiRequest, NextApiResponse } from "next";

const handle = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  switch (req.method) {
    case "GET":
      return handleGET(req, res);
    case "PUT":
      return handlePUT(req, res);
    default:
      return res.status(404).send("");
  }
};

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  const dataSource = await getDataSourceFromRequest(req);

  if (!dataSource) return res.status(404).send("");

  const service = await getQueryService({ dataSource });

  await service.connect();

  const record = await service.getRecord(
    req.query.tableName as string,
    req.query.recordId as string
  );

  await service.disconnect();

  res.json(ApiResponse.withData(record));
}

async function handlePUT(req: NextApiRequest, res: NextApiResponse) {
  if (!req?.body?.changes || Object.keys(req.body.changes).length === 0)
    return res.send(ApiResponse.withError("No changes sent."));
  const dataSource = await getDataSourceFromRequest(req);

  if (!dataSource) return res.status(404).send("");

  const service = await getQueryService({ dataSource });

  await service.connect();

  const data = await service.updateRecord(
    req.query.tableName as string,
    req.query.recordId as string,
    req.body.changes
  );

  await service.disconnect();

  res.json(ApiResponse.withData(data, { message: `Updated -> ${JSON.stringify(req?.body?.changes)}` }));
}

export default withSentry(IsSignedIn(OwnsDataSource(handle)));

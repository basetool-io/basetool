import { decodeObject } from "@/lib/encoding"
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

  const filters = decodeObject(req.query.filters as string)
  let queryError
  let records
  try {
    records = await service.getRecords({
      tableName: req.query.tableName as string,
      filters,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : null,
      offset: req.query.offset ? parseInt(req.query.offset as string, 10) : null,
      orderBy: req.query.orderBy as string,
      orderDirection: req.query.orderDirection as string,}
    );
  } catch (error: any) {
    queryError = error.message
  }

  const count = await service.getRecordsCount(
    req.query.tableName as string
  );

  await service.disconnect();

  if (queryError) {
    res.json(ApiResponse.withError(queryError));
  } else {
    res.json(ApiResponse.withData(records, {meta: {count}}));
  }
}

async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
  if (!req?.body?.record || Object.keys(req.body.record).length === 0)
    return res.send(ApiResponse.withError("No record sent."));
  const dataSource = await getDataSourceFromRequest(req);

  if (!dataSource) return res.status(404).send("");

  const service = await getQueryService({ dataSource });

  await service.connect();

  const { record } = req.body;

  let data;

  try {
    data = await service.createRecord(
      req.query.tableName as string,
      record
    );
  } catch (error: any) {
    return res.json(ApiResponse.withError(error.message));
  }

  await service.disconnect();

  res.json(ApiResponse.withData({ id: data }, { message: "Record added" }));
}

export default withSentry(IsSignedIn(OwnsDataSource(handle)));

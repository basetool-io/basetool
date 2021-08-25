import { withSentry } from "@sentry/nextjs";
import IsSignedIn from "@/pages/api/middleware/IsSignedIn";
import OwnsDataSource from "@/pages/api/middleware/OwnsDataSource";
import isNull from "lodash/isNull";
import type { NextApiRequest, NextApiResponse } from "next";
import { getDataSourceFromRequest } from "@/features/api";
import ApiResponse from "@/features/api/ApiResponse";
import getQueryService from "@/plugins/data-sources/getQueryService";

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

  const QueryService = await getQueryService(dataSource);

  if (!QueryService) {
    return res.status(404).send("");
  }

  if (dataSource?.options?.url) {
    const service = new QueryService({ dataSource });

    await service.connect();

    const records = await service.getRecords(req.query.tableName as string);

    await service.disconnect();

    res.json(ApiResponse.withData(records));
  } else {
    res.status(404).send("");
  }
}

async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
  if (!req?.body?.record || Object.keys(req.body.record).length === 0)
    return res.send(ApiResponse.withError("No record sent."));
  const dataSource = await getDataSourceFromRequest(req);

  if (!dataSource) return res.status(404).send("");

  const QueryService = await getQueryService(dataSource);

  if (!QueryService) {
    return res.status(404).send("");
  }

  const service = new QueryService({ dataSource });

  await service.connect();

  const columns: string[] = [];
  const values: any[] = [];
  // @todo: fetch this value in a dynamic way
  const primaryKey = "id";

  const { record } = req.body;
  Object.entries(record).forEach(([name, value]) => {
    columns.push(name);
    values.push(isNull(value) ? "NULL" : `'${value}'`);
  });

  console.log(123);
  let data;

  try {
    data = await service.createRecord(
      req.query.tableName as string,
      req.query.recordId as string,
      primaryKey,
      columns,
      values
    );
  } catch (error) {
    return res.json(ApiResponse.withError(error.message));
  }

  await service.disconnect();

  res.json(ApiResponse.withData(data, { message: "Record added" }));
}

export default withSentry(IsSignedIn(OwnsDataSource(handle)));

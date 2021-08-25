import { withSentry } from "@sentry/nextjs";
import IsSignedIn from "@/pages/api/middleware/IsSignedIn";
import OwnsDataSource from "@/pages/api/middleware/OwnsDataSource";
import type { NextApiRequest, NextApiResponse } from "next";
import { getDataSourceFromRequest } from "@/features/api";
import { idColumns } from "@/features/fields";
import ApiResponse from "@/features/api/ApiResponse";
import getQueryService from "@/plugins/data-sources/getQueryService";

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

  const QueryService = await getQueryService(dataSource);

  if (!QueryService) {
    return res.status(404).send("");
  }

  if (dataSource?.options?.url) {
    const service = new QueryService({ dataSource });

    await service.connect();

    const record = await service.getRecord(
      req.query.tableName as string,
      req.query.recordId as string
    );

    await service.disconnect();

    res.json(ApiResponse.withData(record));
  } else {
    res.status(404).send("");
  }
}

async function handlePUT(req: NextApiRequest, res: NextApiResponse) {
  if (!req?.body?.changes || Object.keys(req.body.changes).length === 0)
    return res.send(ApiResponse.withError("No changes sent."));
  const dataSource = await getDataSourceFromRequest(req);

  if (!dataSource) return res.status(404).send("");

  const QueryService = await getQueryService(dataSource);

  if (!QueryService) {
    return res.status(404).send("");
  }

  const service = new QueryService({ dataSource });

  await service.connect();

  const payload = Object.entries(req.body.changes)
    .filter(([column]) => !idColumns.includes(column))
    .map(([column, value]) => `${column} = '${value}'`)
    .join(",");

  const data = await service.updateRecord(
    req.query.tableName as string,
    req.query.recordId as string,
    payload
  );

  await service.disconnect();

  res.json(ApiResponse.withData(data, { message: "Updated" }));
}

export default withSentry(IsSignedIn(OwnsDataSource(handle)));

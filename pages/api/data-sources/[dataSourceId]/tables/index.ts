import { withSentry } from "@sentry/nextjs";
import IsSignedIn from "@/pages/api/middleware/IsSignedIn";
import OwnsDataSource from "@/pages/api/middleware/OwnsDataSource";
import type { NextApiRequest, NextApiResponse } from "next";
import { PostgresDataSource } from "@/plugins/data-sources/postgresql/types";
import ApiResponse from "@/features/api/ApiResponse";
import { getDataSourceFromRequest } from "@/features/api";
import getQueryService from "@/plugins/data-sources/getQueryService";

const handle = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  switch (req.method) {
    case "GET":
      return handleGET(req, res);
    default:
      return res.status(404).send("");
  }
};

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  const dataSource = (await getDataSourceFromRequest(
    req
  )) as PostgresDataSource | null;
  console.log("dataSource->", dataSource);

  if (!dataSource) return res.status(404).send("");

  const QueryService = await getQueryService(dataSource);

  if (!QueryService) {
    return res.status(404).send("");
  }

  if (dataSource?.options?.url) {
    const service = new QueryService({ dataSource });

    await service.connect();

    const tables = await service.getTables();

    await service.disconnect();

    res.json(ApiResponse.withData(tables));
  } else {
    res.status(404).send("");
  }
}

export default withSentry(IsSignedIn(OwnsDataSource(handle)));

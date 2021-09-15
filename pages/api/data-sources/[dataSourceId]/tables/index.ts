import { PostgresqlDataSource } from "@/plugins/data-sources/postgresql/types";
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
    default:
      return res.status(404).send("");
  }
};

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  const dataSource = (await getDataSourceFromRequest(
    req
  )) as PostgresqlDataSource | null;

  if (!dataSource) return res.status(404).send("");

  const service = await getQueryService({dataSource});

  await service.connect();

  const tables = await service.getTables();

  await service.disconnect();

  res.json(ApiResponse.withData(tables));
}

export default withSentry(IsSignedIn(OwnsDataSource(handle)));

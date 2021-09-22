import { getDataSourceFromRequest } from "@/features/api";
import { withSentry } from "@sentry/nextjs";
import ApiResponse from "@/features/api/ApiResponse";
import IsSignedIn from "@/features/api/middlewares/IsSignedIn";
import OwnsDataSource from "@/features/api/middlewares/OwnsDataSource";
import getQueryService from "@/plugins/data-sources/getQueryService";
import type { NextApiRequest, NextApiResponse } from "next";

const handle = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  switch (req.method) {
    case "DELETE":
      return handleDELETE(req, res);
    default:
      return res.status(404).send("");
  }
};

async function handleDELETE(req: NextApiRequest, res: NextApiResponse) {
  const dataSource = await getDataSourceFromRequest(req);

  if (!dataSource) return res.status(404).send("");

  const service = await getQueryService({ dataSource });

  await service.connect();

  let data;
  try {
    data = await service.deleteRecords(
      req.query.tableName as string,
      req.body as number[],
    );
  } catch (error: any) {
    await service.disconnect();

    return res.json(ApiResponse.withError(error.message));
  }

  await service.disconnect();

  res.json(
    ApiResponse.withData(data, {
      message: `Deleted -> ${req.body.length} record(s) from ${req.query.tableName}`,
    })
  );
}


export default withSentry(IsSignedIn(OwnsDataSource(handle)));

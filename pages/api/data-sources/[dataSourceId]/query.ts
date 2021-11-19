import { getDataSourceFromRequest } from "@/features/api";
import { withMiddlewares } from "@/features/api/middleware";
import ApiResponse from "@/features/api/ApiResponse";
import catalog from "@/plugins/data-sources/catalog";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  switch (req.method) {
    case "POST":
      return handlePOST(req, res);
    default:
      return res.status(404).send("");
  }
};

async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.PROXY_SECRET !== req?.body?.secret)
    return res.status(404).send("");
  if (!req?.body?.queries)
    return res.send(ApiResponse.withError("No queries sent."));

  const dataSource = await getDataSourceFromRequest(req);

  if (!dataSource)
    return res.send(ApiResponse.withError("Invalid data source."));

  const service = await catalog.getConnection(dataSource);

  try {
    return res.send(await service.runQueries(req?.body?.queries));
  } catch (error) {
    return res.status(500).send({
      error: true,
      type: error.constructor.name,
      message: error.message,
      stack: error.stack,
    });
  }
}

export default withMiddlewares(handler, { middlewares: [] });

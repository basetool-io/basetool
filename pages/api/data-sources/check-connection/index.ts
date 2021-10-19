import { checkHeartbeat } from 'knex-utils';
import { getQueryServiceClass } from '@/plugins/data-sources/getQueryService';
import { withMiddlewares } from "@/features/api/middleware";
import ApiResponse from "@/features/api/ApiResponse";
import IsSignedIn from "@/features/api/middlewares/IsSignedIn";
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
  const queryService = await getQueryServiceClass(req.body.type);

  const client = await queryService.initClient(req.body.credentials);
  const response = await checkHeartbeat(client);

  if (response.isOk) {
    return res.json(ApiResponse.withMessage("Connection successful"));
  } else {
    return res.json(ApiResponse.withError(response.error ? response.error.toString() : "An error occurred"));
  }
}

export default withMiddlewares(handler, {
  middlewares: [[IsSignedIn, {}]],
});

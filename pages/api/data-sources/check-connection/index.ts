import { HeartbeatResult } from "knex-utils/dist/lib/heartbeatUtils"
import { checkHeartbeat } from "knex-utils";
import { first } from "lodash"
import { getKnexClient } from "@/plugins/data-sources/abstract-sql-query-service/getKnexClient";
import {
  getOverrides,
  runInSSHTunnel,
} from "@/plugins/data-sources/QueryServiceWrapper";
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
  // Get local port number
  const overrides = await getOverrides();
  // Set the dbCredentials
  const dbCredentials = {
    ...req.body.credentials,
  };
  // Add the overrides to the client credentials
  const clientCredentials = {
    ...req.body.credentials,
    ...overrides,
  };
  // Set the SSH creds
  const SSHCredentials = {
    ...req.body.ssh
  }
  // Get a new client
  const client = getKnexClient(req.body.type, clientCredentials);

  // Wrap the action in an array
  const actions = [() => checkHeartbeat(client)];
  // Check the connection
  const response = first(await runInSSHTunnel({
    overrides,
    actions,
    dbCredentials,
    SSHCredentials,
  })) as HeartbeatResult;

  if (response.isOk) {
    return res.json(ApiResponse.withMessage("Connection successful"));
  } else {
    return res.json(
      ApiResponse.withError(
        response.error ? response.error.toString() : "Something went wrong with the request. The credentials might be invalid."
      )
    );
  }
}

export default withMiddlewares(handler, {
  middlewares: [[IsSignedIn, {}]],
});

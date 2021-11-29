import * as fs from "fs";
import { FormCredentials, SSHCredentials as ISSHCredentials, ParsedCredentials } from "@/plugins/data-sources/types";
import { HeartbeatResult } from "knex-utils/dist/lib/heartbeatUtils";
import { SSHConnectionError } from "@/lib/errors";
import { SSHTunnelCredentials } from "@/plugins/data-sources/types";
import { checkHeartbeat } from "knex-utils";
import { first, isString } from "lodash";
import { getKnexClient } from "@/plugins/data-sources/abstract-sql-query-service/getKnexClient";
import {
  getOverrides,
  runInSSHTunnel,
} from "@/plugins/data-sources/QueryServiceWrapper";
import { trimValues } from "@/lib/helpers";
import { withMiddlewares } from "@/features/api/middleware";
import ApiResponse from "@/features/api/ApiResponse";
import IsSignedIn from "@/features/api/middlewares/IsSignedIn";
import formidable from "formidable";
import type { NextApiRequest, NextApiResponse } from "next";
import { parseCredentials } from "."

export const config = {
  api: {
    bodyParser: false,
  },
};

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
  const parsedCreds = await parseCredentials(req);
  let { SSHCredentials } = parsedCreds;
  const { type, credentials, options, files } = parsedCreds;

  let response: HeartbeatResult = { isOk: false };

  if (options.connectsWithSSH) {
    // Get local port number
    const overrides = await getOverrides();
    // Add the overrides to the client credentials
    const clientCredentials = {
      ...credentials,
      ...overrides,
    };

    // Get a new client
    const client = getKnexClient(type, clientCredentials);

    // Wrap the action in an array
    const actions = [() => checkHeartbeat(client)];

    // If we get the key from the client we try and add it to the configuration
    if (files.key) {
      const privateKey = fs.readFileSync(files.key._writeStream.path);

      SSHCredentials = {
        ...SSHCredentials,
        privateKey,
        passphrase: SSHCredentials.passphrase,
      };
    }

    // Create the final SSH tunnel configuration
    const tunnelConfig: SSHTunnelCredentials = {
      overrides,
      actions,
      dbCredentials: credentials,
      SSHCredentials,
    };

    try {
      const results = await runInSSHTunnel(tunnelConfig);
      response = first(results) as HeartbeatResult;
    } catch (error) {
      if (error instanceof SSHConnectionError) {
        return res.send(ApiResponse.withError(error.message));
      }
    }
  } else {
    // Get a new client
    const client = getKnexClient(type, credentials);

    // Check heartbeat
    response = await checkHeartbeat(client);
  }
  // Check the connection

  if (response.isOk) {
    return res.json(ApiResponse.withMessage("🎉 Connection successful"));
  } else {
    return res.json(
      ApiResponse.withError(
        response.error
          ? response.error.toString()
          : "Something went wrong with the request. The credentials might be invalid."
      )
    );
  }
}

export default withMiddlewares(handler, {
  middlewares: [[IsSignedIn, {}]],
});

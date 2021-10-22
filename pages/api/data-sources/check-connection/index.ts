import { HeartbeatResult } from "knex-utils/dist/lib/heartbeatUtils";
import { SSHConnectionError } from "@/lib/errors";
import { checkHeartbeat } from "knex-utils";
import { first } from "lodash";
import { getKnexClient } from "@/plugins/data-sources/abstract-sql-query-service/getKnexClient";
import {
  getOverrides,
  runInSSHTunnel,
} from "@/plugins/data-sources/QueryServiceWrapper";
import { withMiddlewares } from "@/features/api/middleware";
import ApiResponse from "@/features/api/ApiResponse";
import IsSignedIn from "@/features/api/middlewares/IsSignedIn";
import formidable from "formidable";
import type { NextApiRequest, NextApiResponse } from "next";

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
  const form = formidable();
  const { fields, files } = await new Promise((resolve, reject) => {
    return form.parse(req, (error: any, fields: any, files: any) => {
      if (error) reject(error);
      console.log(2, error, fields, files);

      resolve({ fields, files });
    });
  });

  const privateKey = files[0];
  const type = fields.type;
  const credentials = JSON.parse(fields.credentials);
  const ssh = fields.ssh ? JSON.parse(fields.ssh) : {};

  // Get local port number
  const overrides = await getOverrides();
  // Set the dbCredentials
  const dbCredentials = {
    ...credentials,
  };
  // Add the overrides to the client credentials
  const clientCredentials = {
    ...credentials,
    ...overrides,
  };
  // Set the SSH creds
  const SSHCredentials = {
    ...ssh,
    privateKey,
  };
  delete SSHCredentials.password;
  // console.log(
  //   "SSHCredentials->",
  //   ssh,
  //   dbCredentials,
  //   clientCredentials,
  //   // SSHCredentials
  // );
  // return res.send({});
  // Get a new client
  const client = getKnexClient(type, clientCredentials);

  // Wrap the action in an array
  const actions = [() => checkHeartbeat(client)];
  // Check the connection
  try {
    const results = await runInSSHTunnel({
      overrides,
      actions,
      dbCredentials,
      SSHCredentials,
    });
    const response = first(results) as HeartbeatResult;

    if (response.isOk) {
      return res.json(ApiResponse.withMessage("Connection successful"));
    } else {
      return res.json(
        ApiResponse.withError(
          response.error
            ? response.error.toString()
            : "Something went wrong with the request. The credentials might be invalid."
        )
      );
    }
  } catch (error) {
    if (error instanceof SSHConnectionError) {
      return res.send(ApiResponse.withError(error.message));
    }
  }
}

export default withMiddlewares(handler, {
  middlewares: [[IsSignedIn, {}]],
});

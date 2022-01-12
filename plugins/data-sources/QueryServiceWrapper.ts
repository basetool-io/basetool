import { DataSource } from "@prisma/client";
import { IQueryServiceWrapper, SSHTunnelCredentials } from "./types";
import { ISQLQueryService } from "./abstract-sql-query-service/types";
import { LOCALHOST } from "@/lib/constants";
import { SQLError, SSHConnectionError } from "@/lib/errors";
import { Server } from "net";
import { decrypt, encrypt } from "@/lib/crypto";
import { isString } from "lodash";
import { s3KeysBucket } from "@/features/data-sources";
import S3 from "aws-sdk/clients/s3";
import cache from "@/features/cache";
import getPort from "get-port";
import tunnel from "tunnel-ssh";

export default class QueryServiceWrapper implements IQueryServiceWrapper {
  public queryService: ISQLQueryService;
  public dataSource: DataSource;

  constructor(
    queryService: any,
    dataSource: DataSource,
    options?: Record<string, unknown>
  ) {
    this.dataSource = dataSource;
    const payload = { dataSource, options };
    this.queryService = new queryService(payload) as ISQLQueryService;
  }

  public async runQuery(name: keyof ISQLQueryService, payload?: unknown) {
    // Use the runQueries method and display the first result
    return (await this.runQueries([{ name, payload }]))[0];
  }

  public async runQueries(
    queries: { name: keyof ISQLQueryService; payload?: unknown }[]
  ) {
    let response;

    // Create a payload with the requests each as a an anonymous function that we can run at a later time.
    const actions = queries.map(
      (query) => () => this.queryService[query.name](query.payload)
    );

    // If the datasource has SSH credentials we should use a tunnel to pass the connection through.
    if ((this.dataSource.options as any)?.connectsWithSSH) {
      const overrides = await getOverrides();
      // Update the client with the new SSH tunnel credentials
      await this.queryService.updateClient(overrides);

      const dbCredentials = this.queryService.getCredentials();
      dbCredentials.port = parseInt(dbCredentials.port);
      const SSHCredentials = this.queryService.getSSHCredentials();
      SSHCredentials.port = parseInt(SSHCredentials.port);

      // Grab the SSH key from S3 if required
      if ((this.dataSource?.options as any)?.connectsWithSSHKey) {
        SSHCredentials.privateKey = await getSSHKey(
          this.queryService.dataSource.id.toString()
        );
      }

      try {
        response = await runInSSHTunnel({
          overrides,
          actions,
          dbCredentials,
          SSHCredentials,
        });
      } catch (error: any) {
        // If it's an SSH Error we just want to bubble it up. if it's an SQL error, mark it as one and bubble it up.
        if (error instanceof SSHConnectionError) {
          throw error;
        } else {
          throw new SQLError(isString(error) ? error : error.message);
        }
      }
    } else {
      try {
        response = await Promise.all(actions.map((a) => a()));
      } catch (error: any) {
        throw new SQLError(isString(error) ? error : error.message);
      }
    }

    return response;
  }

  public async disconnect() {
    return await this.queryService.disconnect();
  }
}

// SSH Tunnelling overrides.
// This is mostly needed to fetch a port from localhost at the moment.
export const getOverrides = async () => {
  return {
    host: LOCALHOST,
    port: await getPort(),
  };
};

export const runInSSHTunnel = async ({
  overrides,
  actions,
  dbCredentials,
  SSHCredentials,
}: SSHTunnelCredentials): Promise<Array<unknown>> => {
  let sshTunnel: Server | undefined;
  let response: Array<unknown>;

  // Create a tunnel config object
  const tunnelConfig = {
    // Credentials for the server we SSH into
    username: SSHCredentials.user,
    password: SSHCredentials.password,
    host: SSHCredentials.host,
    port: SSHCredentials.port,
    // Credentials for the Datasource we're hooking into
    dstHost: dbCredentials.host,
    dstPort: dbCredentials.port,
    // Credentials for the tunnel we're using to bridge the connection.
    localHost: overrides.host,
    localPort: overrides.port,
    privateKey: SSHCredentials.privateKey,
    passphrase: SSHCredentials.passphrase,
  };

  // Because the tunnel uses a callback we're going to wrap it into a promise so we can await for it later.
  const tunnelPromise: Promise<Array<unknown>> = new Promise(
    (resolve, reject) => {
      sshTunnel = tunnel(tunnelConfig, function (error: any, server: Server) {
        if (error) reject(error);

        // Run the query and resolve/reject the promise with the result
        Promise.all(actions.map((action) => action()))
          .then((response: any) => resolve(response))
          .catch((error: any) => reject(error));
      });
      sshTunnel.on("error", (error) => {
        return reject(new SSHConnectionError(error.message));
      });
    }
  );

  try {
    // Await for the response from the DB query
    response = await tunnelPromise;
  } catch (error) {
    // If we get an error close the connection.
    if (sshTunnel) await sshTunnel.close();

    // Bubble the error up
    throw error;
  }

  // Closing the connection so it doesn't persist infinitely.
  if (sshTunnel) await sshTunnel.close();

  return response;
};

/**
 * Fetches and caches the key from S3
 */
const getSSHKey = async (Key: string) => {
  return await fetchKeyFromS3(Key);
};

/**
 * Fetches the key from S3
 */
const fetchKeyFromS3 = async (Key: string) => {
  const S3Client = new S3({
    accessKeyId: process.env.AWS_S3_DS_KEYS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_DS_KEYS_SECRET_ACCESS_KEY,
    region: process.env.AWS_S3_DS_KEYS_REGION,
  });

  const params = {
    Key,
    Bucket: s3KeysBucket(),
  };

  const response = await S3Client.getObject(params).promise();

  if (!response.ETag) throw new Error("Failed to fetch the SSH key.");

  return response.Body;
};

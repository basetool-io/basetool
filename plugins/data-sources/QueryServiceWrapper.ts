import {
  ClientOverrides,
  DataSourceCredentials,
  ISQLQueryService,
} from "./abstract-sql-query-service/types";
import { DataSource } from "@prisma/client";
import {
  IQueryServiceWrapper,
  QueryServiceWrapperPayload,
  SSHCredentials,
} from "./types";
import { LOCALHOST } from "@/lib/constants";
import { Server } from "net";
import getPort from "get-port";
import tunnel from "tunnel-ssh";

export default class QueryServiceWrapper implements IQueryServiceWrapper {
  public queryService: ISQLQueryService;
  public dataSource: DataSource;

  constructor(queryService: any, payload: QueryServiceWrapperPayload) {
    this.dataSource = payload.dataSource;
    this.queryService = new queryService(payload) as ISQLQueryService;
  }

  public async runQuery(name: keyof ISQLQueryService, payload?: unknown) {
    // Use the runQueries method and display the first result
    return (await this.runQueries([{ name, payload }]))[0];
  }

  public async runQueries(
    queries: Array<{ name: keyof ISQLQueryService; payload?: unknown }>
  ) {
    let response;

    await this.queryService.connect();

    // Create a payload with the requests each as a an anonymous function that we can run at a later time.
    const actions = queries.map(
      (query) => () => this.queryService[query.name](query.payload)
    );

    // If the datasource has SSH credentials we should use a tunnel to pass the connection through.
    if (this.dataSource.encryptedSSHCredentials) {
      const overrides = await getOverrides();
      // Update the client with the new SSH tunnel credentials
      await this.queryService.updateClient(overrides);

      const dbCredentials = this.queryService.getCredentials();
      dbCredentials.port = parseInt(dbCredentials.port);
      const SSHCredentials = this.queryService.getSSHCredentials();
      SSHCredentials.port = parseInt(SSHCredentials.port);

      response = await runInSSHTunnel({
        overrides,
        actions,
        dbCredentials,
        SSHCredentials,
      });
    } else {
      response = await Promise.all(actions.map((a) => a()));
    }

    await this.queryService.disconnect();

    return response;
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
}: {
  overrides: ClientOverrides;
  actions: Array<() => Promise<unknown>>;
  dbCredentials: DataSourceCredentials;
  SSHCredentials: SSHCredentials;
}): Promise<Array<unknown>> => {
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

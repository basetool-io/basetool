import { DataSource } from "@prisma/client";
import {
  IQueryService,
  IQueryServiceWrapper,
  QueryServiceWrapperPayload,
} from "./types";
import { LOCALHOST } from "@/lib/constants";
import { Server } from "net";
import getPort from "get-port";
import tunnel from "tunnel-ssh";

export default class QueryServiceWrapper implements IQueryServiceWrapper {
  public queryService: IQueryService;
  public dataSource: DataSource;
  public tunnel: Server | undefined;

  constructor(queryService: any, payload: QueryServiceWrapperPayload) {
    this.dataSource = payload.dataSource;
    this.queryService = new queryService(payload) as IQueryService;
  }

  public async runQuery(name: keyof IQueryService, payload?: unknown) {
    await this.queryService.connect();

    let response;

    // If the datasource has SSH credentials we should use a tunnel to pass the connection through.
    if (this.dataSource.encryptedSSHCredentials) {
      const overrides = {
        host: LOCALHOST,
        port: await getPort(),
      };

      // Update the client with the new SSH credentials
      await this.queryService.updateClient(overrides);
      const credentials = this.queryService.getCredentials();
      const SSHCredentials = this.queryService.getSSHCredentials();

      const tunnelConfig = {
        // Credentials for the server we SSH into
        username: SSHCredentials.user,
        password: SSHCredentials.password,
        host: SSHCredentials.host,
        port: parseInt(SSHCredentials.port),
        // Credentials for the Datasource we're hooking into
        dstHost: credentials.host,
        dstPort: parseInt(credentials.port),
        // Credentials for the tunnel we're using to bridge the connection.
        localHost: overrides.host,
        localPort: overrides.port,
      };

      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const vm = this;

      // Because the tunnel uses a callback we're going to wrap it into a promise so we can await for it later.
      const tunnelPromise = new Promise((resolve, reject) => {
        this.tunnel = tunnel(
          tunnelConfig,
          function (error: any, server: Server) {
            if (error) reject(error);

            // Run the query and resolve/reject the promise with the result
            vm.queryService[name](payload)
              .then((response: any) => resolve(response))
              .catch((error: any) => reject(error));
          }
        );
      });

      try {
        response = await tunnelPromise;
      } catch (error) {
        // Closing the connection so it doesn't persist infinitely
        if (this.tunnel) await this.tunnel.close();

        // Bubble the error up
        throw error;
      }

      if (this.tunnel) await this.tunnel.close();
    } else {
      response = await this.queryService[name](payload);
    }

    await this.queryService.disconnect();

    return response;
  }

  public async runQueries(
    queries: { name: keyof IQueryService; payload?: unknown }[]
  ) {
    await this.queryService.connect();

    let response;

    // If the datasource has SSH credentials we should use a tunnel to pass the connection through.
    if (this.dataSource.encryptedSSHCredentials) {
      const overrides = {
        host: LOCALHOST,
        port: await getPort(),
      };

      // Update the client with the new SSH credentials
      await this.queryService.updateClient(overrides);
      const credentials = this.queryService.getCredentials();
      const SSHCredentials = this.queryService.getSSHCredentials();

      const tunnelConfig = {
        // Credentials for the server we SSH into
        username: SSHCredentials.user,
        password: SSHCredentials.password,
        host: SSHCredentials.host,
        port: parseInt(SSHCredentials.port),
        // Credentials for the Datasource we're hooking into
        dstHost: credentials.host,
        dstPort: parseInt(credentials.port),
        // Credentials for the tunnel we're using to bridge the connection.
        localHost: overrides.host,
        localPort: overrides.port,
      };

      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const vm = this;

      // Because the tunnel uses a callback we're going to wrap it into a promise so we can await for it later.
      const tunnelPromise = new Promise((resolve, reject) => {
        this.tunnel = tunnel(
          tunnelConfig,
          function (error: any, server: Server) {
            if (error) reject(error);

            Promise.all(
              queries.map(({ name, payload }) => {
                return vm.queryService[name](payload);
              })
            )
              .then((response: any) => resolve(response))
              .catch((error: any) => reject(error));
          }
        );
      });

      try {
        response = await tunnelPromise;
      } catch (error) {
        // Closing the connection so it doesn't persist infinitely
        if (this.tunnel) await this.tunnel.close();

        // Bubble the error up
        throw error;
      }

      if (this.tunnel) await this.tunnel.close();
    } else {
      response = await Promise.all(
        queries.map(({ name, payload }) => {
          return this.queryService[name](payload);
        })
      );
    }

    await this.queryService.disconnect();

    return response;
  }
}

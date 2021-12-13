import { DataSource } from "@prisma/client";
import { IQueryServiceWrapper } from "./types";
import {
  POOLER_CONNECTION_TIMEOUT,
  POOLER_MAX_DB_CONNECTIONS,
} from "@/lib/constants";
import { getQueryServiceWrapper } from "./serverHelpers";
import { groupBy } from "lodash";
import { randomString } from "@/lib/helpers";
import io from "@pm2/io";
import logger from "@/lib/logger";

type Connection = {
  id: string;
  dataSourceId: string;
  type: string;
  service: IQueryServiceWrapper;
  createdAt: number;
  operationsCount: number;
};

class ConnectionPooler {
  public connections: Connection[] = [];

  // Each connection pooler gets an ID
  public id = randomString(6);

  public async getConnection(
    dataSource: DataSource
  ): Promise<IQueryServiceWrapper> {
    const dataSourceId = dataSource.id.toString();
    const existingConnections = this.connections.filter((connection) => {
      const hasMoreThanTenSecondsOfLife =
        Date.now() - connection.createdAt < POOLER_CONNECTION_TIMEOUT - 10000;

      return (
        connection.dataSourceId.toString() === dataSourceId &&
        hasMoreThanTenSecondsOfLife
      );
    });

    if (existingConnections) {
      // Spin up a few connections
      if (existingConnections.length < POOLER_MAX_DB_CONNECTIONS) {
        const connection = await this.newConnection(dataSource);

        this.connections.push(connection);

        return await this.useConnection(connection);
      }

      const connection = existingConnections.sort(
        (a, b) => a.operationsCount - b.operationsCount
      )[0];

      logger.debug(
        `ConnectionPooler.id: ${this.id} returning existing connection ${connection.id} (op: ${connection.operationsCount}) for DS_id ${dataSourceId}.`
      );
      connection.operationsCount++;

      return await this.useConnection(connection);
    }

    // Spin up a new connection
    const connection = await this.newConnection(dataSource);
    this.connections.push(connection);

    return await this.useConnection(connection);
  }

  private async newConnection(dataSource: DataSource): Promise<Connection> {
    const dataSourceId = dataSource.id.toString();
    const service = await getQueryServiceWrapper(dataSource);
    const id = randomString(6);
    logger.debug(
      `ConnectionPooler.id: ${this.id} created connection with ${id} for ds_id: ${dataSourceId}.`
    );

    return {
      id,
      dataSourceId,
      type: dataSource.type,
      service,
      createdAt: Date.now(),
      operationsCount: 1,
    };
  }

  private async cleanup(ignoredConnection: Connection): Promise<void> {
    const purgeableConnections = this.connections.filter((connection) => {
      if (
        ignoredConnection.id !== connection.id &&
        Date.now() - connection.createdAt > POOLER_CONNECTION_TIMEOUT
      ) {
        return true;
      }

      return false;
    });

    Promise.all(
      purgeableConnections.map((connection) => {
        connection.service.disconnect();
      })
    );

    const purgeableConnectionsIds = purgeableConnections.map(({ id }) => id);
    this.connections = this.connections.filter(
      (connection) => !purgeableConnectionsIds.includes(connection.id)
    );
  }

  private async useConnection(
    connection: Connection
  ): Promise<IQueryServiceWrapper> {
    this.cleanup(connection);
    this.updatePM2Metric();

    return connection.service;
  }

  private updatePM2Metric() {
    io.metric({ name: "DB connections" }).set(this.connections.length);
    io.metric({ name: "Unique DB connections" }).set(
      Object.keys(groupBy(this.connections, "dataSourceId")).length
    );
  }
}

// add prisma to the NodeJS global type
interface CustomNodeJsGlobal {
  pooler: ConnectionPooler;
}

// Prevent multiple instances of Prisma Client in development
declare const global: CustomNodeJsGlobal;

const pooler = global.pooler || new ConnectionPooler();

if (process.env.NODE_ENV === "development") global.pooler = pooler;

export default pooler;

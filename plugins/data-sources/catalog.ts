import { DataSource } from "@prisma/client";
import { IQueryServiceWrapper } from "./types";
import { getQueryServiceWrapper } from "./serverHelpers";
import { randomString } from "@/lib/helpers";
import logger from "@/lib/logger";

type Connection = {
  id: string;
  type: string;
  service: IQueryServiceWrapper;
  createdAt: number;
};

class Catalog {
  public connections: Connection[] = [];
  public id = randomString(6);

  public async getConnection(
    dataSource: DataSource
  ): Promise<IQueryServiceWrapper> {
    const id = dataSource.id.toString();
    const existingConnection = this.connections.find(
      (connection) => connection.id.toString() === id
    );

    if (existingConnection) {
      logger.debug(`Catalog.id: ${this.id} returning existing connection ${id}.`);

      return existingConnection.service;
    }

    const service = await getQueryServiceWrapper(dataSource);
    logger.debug(`Catalog.id: ${this.id} created connection ${id}.`);

    this.connections.push({
      id,
      type: dataSource.type,
      service,
      createdAt: Date.now(),
    });

    return service;
  }
}

// add prisma to the NodeJS global type
interface CustomNodeJsGlobal {
  catalog: Catalog;
}

// Prevent multiple instances of Prisma Client in development
declare const global: CustomNodeJsGlobal;

const catalog = global.catalog || new Catalog();

if (process.env.NODE_ENV === "development") global.catalog = catalog;

export default catalog;

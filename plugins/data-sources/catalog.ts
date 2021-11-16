// import { PrismaClient } from '@prisma/client'

import { DataSource } from "@prisma/client";
import { QueryServiceWrapperPayload } from "./types";
import QueryServiceWrapper from "./QueryServiceWrapper";

export const getQueryServiceClass = async (type: string) => {
  const dataSourceType = type === "maria_db" ? "mysql" : type;

  return (
    await import(`@/plugins/data-sources/${dataSourceType}/QueryService.ts`)
  ).default;
};

type Connection = {
  id: string;
  type: string;
  service: any;
  createdAt: number
};

class Catalog {
  public connections: Connection[] = [];

  // constructor() {

  // }

  public async getConnection(
    dataSource: DataSource,
    payload: QueryServiceWrapperPayload
  ) {
    const id = dataSource.id.toString();
    const existingConnection = this.connections.find(
      (connection) => connection.id.toString() === id
    );
    if (existingConnection) {
      console.log("existingConnection->");
      // console.log("existingConnection->", existingConnection);

      return existingConnection.service;
    }

    console.log("no existing connection", id);
    const queryServiceClass = await getQueryServiceClass(dataSource.type);

    const service = new QueryServiceWrapper(queryServiceClass, payload);
    this.connections.push({
      id,
      type: dataSource.type,
      service,
      createdAt: Date.now()
    });
    console.log("this.connections->", this.connections.length);

    return service;
  }
}

// add prisma to the NodeJS global type
interface CustomNodeJsGlobal {
  catalog: any;
}

// Prevent multiple instances of Prisma Client in development
declare const global: CustomNodeJsGlobal;
// console.log("global.catalog->", global.catalog);

// const catalog = global.catalog || new Catalog();
const catalog = new Catalog();

if (process.env.NODE_ENV === "development") global.catalog = catalog;
console.log(1, 'catalog->', catalog);

export default catalog;

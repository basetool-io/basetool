import { QueryServiceWrapperPayload } from "./types";
import { getQueryService } from "./serverHelpers"
import { randomString } from "@/lib/helpers"
import QueryServiceWrapper from "./QueryServiceWrapper";

type Connection = {
  id: string;
  type: string;
  service: QueryServiceWrapper;
  createdAt: number;
};

class Catalog {
  public connections: Connection[] = [];
  public id = randomString(6)

  public async getConnection(payload: QueryServiceWrapperPayload): Promise<QueryServiceWrapper> {
    const { dataSource } = payload;
    const id = dataSource.id.toString();
    const existingConnection = this.connections.find(
      (connection) => connection.id.toString() === id
    );

    if (existingConnection) {
      return existingConnection.service;
    }

    const service = await getQueryService(dataSource, payload)

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
// console.log("global.catalog->", global.catalog);

// const catalog = global.catalog || new Catalog();
const catalog = global.catalog || new Catalog();

if (process.env.NODE_ENV === "development") global.catalog = catalog;
// console.log(1, "catalog->", catalog);


export default catalog;

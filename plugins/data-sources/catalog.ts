import { ISQLQueryService } from "./abstract-sql-query-service/types"
import { QueryServiceWrapperPayload } from "./types";
import { randomString } from "@/lib/helpers"
import QueryServiceWrapper from "./QueryServiceWrapper";

export const getQueryServiceClass = async (type: string): Promise<ISQLQueryService> => {
  const dataSourceType = type === "maria_db" ? "mysql" : type;

  return (
    await import(`@/plugins/data-sources/${dataSourceType}/QueryService.ts`)
  ).default;
};

type Connection = {
  id: string;
  type: string;
  service: any;
  createdAt: number;
};

class Catalog {
  public connections: Connection[] = [];
  public id = randomString(6)

  // constructor() {

  // }

  public async getConnection(payload: QueryServiceWrapperPayload): Promise<QueryServiceWrapper> {
    const { dataSource } = payload;
    const id = dataSource.id.toString();
    const existingConnection = this.connections.find(
      (connection) => connection.id.toString() === id
    );
    console.log('getConnection->', this.id, this.connections.map(({id}) => id), this.connections.length)
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
      createdAt: Date.now(),
    });
    console.log("pushing | this.connections->", this.connections.length);

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

import { DataSource } from "@prisma/client";
import { IQueryServiceWrapper } from "./types";
import QueryServiceWrapper from "./QueryServiceWrapper";

const getQueryService = async (payload: {
  dataSource: DataSource;
  options?: Record<string, unknown>;
}): Promise<IQueryServiceWrapper> => {
  let queryService;
  const { dataSource } = payload;
  const dataSourceType =
    dataSource.type === "maria_db" ? "mysql" : dataSource.type;

  try {
    queryService = (
      await import(`@/plugins/data-sources/${dataSourceType}/QueryService.ts`)
    ).default;

    return new QueryServiceWrapper(queryService, payload);
  } catch (error: any) {
    if (error.code === "MODULE_NOT_FOUND") {
      // return "null" QueryServiceWrapper
      return {
        runQuery(name, payload) {
          return null;
        },
        runQueries(queries) {
          return null;
        },
      };
    } else {
      throw error;
    }
  }
};

export default getQueryService;

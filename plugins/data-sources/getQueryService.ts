import { IQueryServiceWrapper, QueryServiceWrapperPayload } from "./types";
import QueryServiceWrapper from "./QueryServiceWrapper";

export const getQueryServiceClass = async (type: string) => {
  const dataSourceType = type === "maria_db" ? "mysql" : type;

  return (
    await import(`@/plugins/data-sources/${dataSourceType}/QueryService.ts`)
  ).default;
};

const getQueryService = async (
  payload: QueryServiceWrapperPayload
): Promise<IQueryServiceWrapper> => {
  let queryService;
  const { dataSource } = payload;

  try {
    queryService = await getQueryServiceClass(dataSource.type);

    return new QueryServiceWrapper(queryService, payload);
  } catch (error: any) {
    if (error.code === "MODULE_NOT_FOUND") {
      // Returning a "null" Query service wrapper
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

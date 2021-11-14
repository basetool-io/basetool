import { IQueryServiceWrapper, QueryServiceWrapperPayload } from "./types";
import catalog from './catalog'

// export const getQueryServiceClass = async (type: string) => {
//   const dataSourceType = type === "maria_db" ? "mysql" : type;

//   return (
//     await import(`@/plugins/data-sources/${dataSourceType}/QueryService.ts`)
//   ).default;
// };

const getQueryService = async (
  payload: QueryServiceWrapperPayload
): Promise<IQueryServiceWrapper> => {
  // let queryService;
  const { dataSource } = payload;
  // console.log('catalog->', catalog)
  console.log('catalog->', catalog)



  try {
    // const queryService = await getQueryServiceClass(dataSource.type);

    // catalog.
    const service = await catalog.getConnection(dataSource, payload)
    // console.log(2, 'service->', service)
    return service

    // return catalog
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

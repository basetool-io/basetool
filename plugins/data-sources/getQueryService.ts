import { DataSource } from "@prisma/client";
import { IQueryService } from "./types"
import NullQueryService from "./NullQueryService"

const getQueryService = async (payload: {
  dataSource: DataSource;
  options?: Record<string, unknown>
}): Promise<IQueryService> => {
  let queryService;
  const {dataSource} = payload

  try {
    queryService = (
      await import(`@/plugins/data-sources/${dataSource.type}/QueryService.ts`)
    ).default;

    return new queryService(payload);
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      return new NullQueryService(payload)
    }else{
      throw error
    }
  }
};

export default getQueryService;

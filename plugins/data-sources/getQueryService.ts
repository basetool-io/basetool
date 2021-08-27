import { DataSource } from "@prisma/client";
import { IQueryService } from "./types"
import NullQueryService from "./NullQueryService"

const getQueryService = async (payload: {
  dataSource: DataSource;
}): Promise<IQueryService> => {
  let queryService;
  const {dataSource} = payload

  try {
    queryService = (
      await import(`@/plugins/data-sources/${dataSource.type}/QueryService.ts`)
    ).default;

    return new queryService(payload);
  } catch (error) {
    return new NullQueryService(payload)
  }
};

export default getQueryService;

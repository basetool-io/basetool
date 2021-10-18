import { DataSourceInfo } from "./types"

const getDataSourceInfo = async (id: string): Promise<DataSourceInfo | undefined> => {
  try {
    return (
      await import(`@/plugins/data-sources/${id}/index.ts`)
    ).default;
  } catch (error) {
  }
};

export default getDataSourceInfo;

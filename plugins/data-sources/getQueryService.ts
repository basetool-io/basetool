import { DataSource } from "@prisma/client";
import { AbstractQueryService } from "./types";

const getQueryService = async (
  dataSource: DataSource
): Promise<AbstractQueryService | undefined> => {
  console.log(
    "1->",
    `@/plugins/data-sources/${dataSource.type}/QueryService.ts`
  );
  try {
    return (
      await import(`@/plugins/data-sources/${dataSource.type}/QueryService.ts`)
    ).default;
  } catch (error) {}
};

export default getQueryService;

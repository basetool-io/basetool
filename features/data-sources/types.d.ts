import { DataQuery as PrismaDataQuery } from "@prisma/client";

interface DataQuery extends PrismaDataQuery {
  options: {
    query: string;
    runOnPageLoad: boolean;
  };
  data: [] | Record<string, never>;
  isLoading: boolean;
  type: string; // one of DataSourceTypes
}

export default DataQuery;

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

export type TableMetaData = {
  name: string;
  idColumn: string;
  nameColumn: string;
  createdAtColumn?: string;
  updatedAtColumn?: string;
};

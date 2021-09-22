import type { Column } from "@/features/fields/types";

export type QueryResponse = {
  data: unknown;
  meta: unknown;
  dataSourceType: DataSourceTypes;
};

export interface IQueryService {
  dataSource: DataSource | undefined;
  queryResult: unknown;

  connect(): Promise<this>;
  disconnect(): Promise<this>;
  getTables(): Promise<{
    name: string
  }[]>;
  getColumns(tableName: string, storedColumns?: Column[]): Promise<Column[]>;
  getRecords({
    tableName: string,
    filters: string,
    limit: number,
    offset: number,
    orderBy: string,
    orderDirection: string,
  }): Promise<[]>;
  getRecordsCount(tableName: string): Promise<number>;
  getRecord(tableName: string, recordId: string): Promise<unknown>;
  updateRecord(
    tableName: string,
    recordId: string,
    data: unknown
  ): Promise<unknown>;
  createRecord(
    tableName: string,
    data: unknown
  ): Promise<string | undefined>;
  deleteRecord(
    tableName: string,
    recordId: string,
  ): Promise<unknown>;
  deleteRecords(
    tableName: string,
    recordIds: number[],
  ): Promise<unknown>;
}

export interface DataSourcePlugin {
  id: string;
  name: string;
  description: string;
}

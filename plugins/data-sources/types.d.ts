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
  getTables(): Promise<[]>;
  getColumns(tableName: string, storedColumns?: Column[]): Promise<[]>;
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
    recordId: string,
    data: unknown
  ): Promise<number | string>;
}

export interface DataSourcePlugin {
  id: string;
  name: string;
  description: string;
}

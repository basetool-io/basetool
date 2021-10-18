import type { Column } from "@/features/fields/types";

export type DataSourceInfo = {
  id: string;
  name: string;
  description: string;
  readOnly: boolean;
  pagination: PaginationType;
  supports?: {
    filters: boolean;
    columnsRequest: boolean;
  };
};

export type PaginationType = "offset" | "cursor";

export type QueryResponse = {
  data: unknown;
  meta: unknown;
  dataSourceType: DataSourceTypes;
};

export interface IQueryServiceWrapper {
  runQuery(name: keyof IQueryService, payload?: unknown);
  runQueries(queries: { name: keyof IQueryService; payload?: unknown }[]);
}
export interface IQueryService {
  dataSource: DataSource | undefined;
  queryResult: unknown;

  connect(): Promise<this>;
  disconnect(): Promise<this>;
  getTables(): Promise<
    {
      name: string;
    }[]
  >;
  getColumns(payload: {
    tableName: string;
    storedColumns?: Column[];
  }): Promise<Column[]>;
  getRecords(payload: {
    tableName: string;
    filters: IFilter[];
    limit?: number;
    offset?: number;
    orderBy: string;
    orderDirection: string;
    columns: Column[];
  }): Promise<[]>;
  getRecordsCount(payload: {
    tableName: string;
    filters: IFilter[];
  }): Promise<number>;
  getRecord(payload: {
    tableName: string;
    recordId: string;
    columns: Column[];
  }): Promise<Record<string, unknown> | undefined>;
  updateRecord({
    tableName: string,
    recordId: string,
    data: unknown,
  }): Promise<unknown>;
  createRecord({
    tableName: string,
    data: unknown,
  }): Promise<string | undefined>;
  deleteRecord({ tableName: string, recordId: string }): Promise<unknown>;
  deleteRecords(payload: {
    tableName: string;
    recordIds: number[];
  }): Promise<unknown>;
}

export interface DataSourcePlugin {
  id: string;
  name: string;
  description: string;
}

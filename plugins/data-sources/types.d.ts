import type { Column } from "@/features/fields/types";

export type DataSourceInfo = {
  id: string;
  name: string;
  description: string;
  readOnly: boolean;
  requests?: {
    [name: string]: boolean
  };
}

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
    select: string[];
  }): Promise<RecordsResponse>;
  getRecordsCount(payload: {
    tableName: string;
    filters: IFilter[];
  }): Promise<number | undefined>;
  getRecord(payload: {
    tableName: string;
    recordId: string;
    select: string[];
  }): Promise<RecordResponse | undefined>;
  updateRecord?({
    tableName: string,
    recordId: string,
    data: unknown,
  }): Promise<unknown>;
  createRecord?({
    tableName: string,
    data: unknown,
  }): Promise<string | undefined>;
  deleteRecord?({ tableName: string, recordId: string }): Promise<unknown>;
  deleteRecords?(payload: {
    tableName: string;
    recordIds: number[];
  }): Promise<unknown>;
}

export interface DataSourcePlugin {
  id: string;
  name: string;
  description: string;
}

type RecordsResponse = {
  records: any[];
  columns?: Column[];
};

type RecordResponse<T = unknown> = {
  record: Record<string, T>;
  columns?: Column[];
};

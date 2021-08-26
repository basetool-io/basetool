import type { Column } from "@/features/fields/types";

export type QueryResponse = {
  data: unknown;
  metadata: unknown;
  dataSourceType: DataSourceTypes;
};

export interface IQueryService {
  dataSource: DataSource | undefined;
  queryResult: unknown;

  connect(): Promise<this>;
  disconnect(): Promise<this>;
  getTables(): Promise<[]>;
  getColumns(tableName: string, storedColumns?: Column[]): Promise<[]>;
  getRecords(tableName: string): Promise<[]>;
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
  // public abstract setQuery(dataQuery: DataQuery): this;
  // public abstract setOptions(options: Record<string, unknown>): this;
  // public toJson(): QueryResponse;
  // public runQuery(dataQuery: DataQuery): Promise<this>;
  // public toApiResponse(): Promise<IApiResponse>;
}

export interface DataSourcePlugin {
  id: string;
  name: string;
  description: string;
  queryEditorComponent: ElementType;
  queryService: any;
  formComponent: any;
  schema: ObjectSchema;
  queryParams: (dataQuery) => string[];
}

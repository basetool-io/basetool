import type DataQuery from '@/prisma'
import type { Column, ListTable } from "@/features/fields/types";

export type QueryResponse = {
  data: unknown;
  metadata: unknown;
  dataSourceType: DataSourceTypes;
};

export interface AbstractQueryService {
  dataSource: DataSource | undefined;
  dataQuery: DataQuery | undefined;
  queryResult: unknown;

  // new (public payload: { dataSource: DataSource });
  public getTables(): Promise<ListTable[]>;
  public getColumns(tableName: string, storedColumns?: Column[]): Promise<[]>;
  public setQuery(dataQuery: DataQuery): this;
  public setOptions(options: Record<string, unknown>): this;
  public toJson(): QueryResponse;
  public runQuery(dataQuery: DataQuery): Promise<this>;
  public toApiResponse(): Promise<IApiResponse>;
  public disconnect?(): Promise<void>;
}

export interface DataSourcePlugin {
  id: string;
  name: string;
  description: string;
  queryEditorComponent: ElementType;
  queryService: any;
  formComponent: any;
  schema: ObjectSchema;
  queryParams: (dataQuery) => string[],
}

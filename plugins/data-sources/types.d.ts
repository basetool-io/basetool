import type DataQuery from '@/prisma'

export type QueryResponse = {
  data: object,
  metadata: object,
  dataSourceType: DataSourceTypes
}

export interface AbstractQueryService {
  public dataSource: DataSource | undefined;
  public dataQuery: DataQuery | undefined;
  public queryResult: any;

  public setQuery(dataQuery: DataQuery): this
  public setOptions(options: object): this
  public toJson(): QueryResponse
  public async runQuery(dataQuery: DataQuery): Promise<this>
  public async toApiResponse(): Promise<IApiResponse>
  public async disconnect?(): Promise<void>
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

import ApiResponse from '@/features/api/ApiResponse'
import { DataSource, PrismaClient } from '@prisma/client'
import { DataSourceTypes } from '../enums'
// import ApiResponse from '@/src/services/ApiResponse'
// import DataSource from '@/types/app-state/DataSource'
import type { AbstractQueryService } from '../types'

export interface PostgresqlDataSource extends DataSource {
  options: {
    url: string
  }
}

// export interface PostgresqlDataQuery extends DataQuery {
//   options: {
//     query: string
//   }
// }

class QueryService implements AbstractQueryService {
  public prisma: PrismaClient;

  public dataSource: PostgresqlDataSource;

  // public stateDataQuery: PostgresqlDataQuery | undefined;

  public queryResult: object = {};

  public options?: {
    queryParams?: {
      [name: string]: string,
    }
  }

  constructor({ dataSource }: { dataSource: DataSource }) {
    this.prisma = new PrismaClient({ datasources: { db: { url: dataSource.options.url } } })
    this.dataSource = dataSource
  }

  get dataQuery(): PostgresqlDataQuery {
    if (!this.stateDataQuery) throw Error('No data query present')

    return this.stateDataQuery
  }

  public setQuery(dataQuery: PostgresqlDataQuery) {
    this.stateDataQuery = dataQuery

    return this
  }

  public setOptions(options: object) {
    this.options = options

    return this
  }

  public async runQuery() {
    if (!this.dataQuery) throw Error('No data query present')

    this.queryResult = await this.prisma.$queryRaw(this.dataQuery.options.query)

    return this
  }

  public toJson() {
    return {
      data: this.queryResult,
      metadata: {},
      dataSourceType: DataSourceTypes.postgresql,
    }
  }

  public async toApiResponse() {
    return ApiResponse.withData(this.toJson())
  }

  /**
   * disconnect
   */
  public disconnect() {
    return this.prisma.$disconnect()
  }
}

export default QueryService

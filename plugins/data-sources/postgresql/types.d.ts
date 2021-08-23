import { DataSource } from '@prisma/client'
import type { Column } from '@/components/fields/types'
import type DataQuery from '@/types/app-state/DataQuery'

export type AxiosErrorWithMessage = {
  message: string
}

export type Table = {
  columns?: {
    [columnName: string]: Column
  }
}

export type Tables = {
  [tableName: string]: Table
}

export interface PostgresDataSource extends DataSource implements DataSource {
  options: {
    url?: string
    columns?: Column[]
    tables?: Tables
  }
}

export interface PostgresDataQuery extends DataQuery implements DataQuery {
  options: {
    query: string
    runOnPageLoad: boolean
  }
}

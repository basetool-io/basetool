import { DataSource } from '@prisma/client'
import type { Column } from '@/components/fields/types'
import type { Knex } from 'knex'

export type AxiosErrorWithMessage = {
  message: string
}

export type ListTable = {
  name: string;
  schema: string;
  label?: string;
  authorizedRoles?: string[];
};

export type Table = {
  columns?: {
    [columnName: string]: Column
  }
  label?: string
  authorizedRoles?: string[];
}

export type Tables = {
  [tableName: string]: Table
}

export interface PostgresqlDataSource extends DataSource implements DataSource {
  options: {
    url?: string
    columns?: Column[]
    tables?: Tables
  }
}

export type PostgresqlColumnOptions = Knex.ColumnInfo

import { Column } from "@/features/fields/types"
import { DataSource } from "@prisma/client"
import { SqlColumnOptions, Tables } from "../abstract-sql-query-service/types"

export type PostgresCredentials = {
  url: string;
  useSsl: boolean;
};

export interface PostgresqlDataSource extends DataSource implements DataSource {
  options: {
    url?: string
    columns?: Column[]
    tables?: Tables
  }
}

export type PostgresqlColumnOptions = SqlColumnOptions


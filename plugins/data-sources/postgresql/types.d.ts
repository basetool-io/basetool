import { Column } from "@/features/fields/types";
import { DataSource } from "@prisma/client";
import { SqlColumnOptions, Tables } from "../abstract-sql-query-service/types";

export type PostgresCredentials = {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  useSsl: boolean;
};

export type PostgresLegacyCredentials = {
  url: string;
  useSsl: boolean;
};

export interface PostgresqlDataSource extends DataSource {
  options: {
    url?: string;
    columns?: Column[];
    tables?: Tables;
  };
}

export type PostgresqlColumnOptions = SqlColumnOptions;

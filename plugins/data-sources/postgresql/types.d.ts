import { Column } from "@/features/fields/types";
import { DataSource } from "@prisma/client";
import { SqlColumnOptions, Tables } from "../abstract-sql-query-service/types";

export type PgCredentials = {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  useSsl: boolean;
};

export type PgLegacyCredentials = {
  url: string;
  useSsl: boolean;
};

export interface PgDataSource extends DataSource {
  options: {
    url?: string;
    columns?: Column[];
    tables?: Tables;
  };
}

export type PgColumnOptions = SqlColumnOptions;

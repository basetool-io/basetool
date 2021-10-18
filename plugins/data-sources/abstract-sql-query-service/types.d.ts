import type { Column } from "@/components/fields/types";
import type { Knex } from "knex";

export type AxiosErrorWithMessage = {
  message: string;
};

export type ListTable = {
  name: string;
  schema: string;
  label?: string;
  authorizedRoles?: string[] | null;
  hidden?: boolean;
  orderIndex?: number;
};

export type Table = {
  columns?: {
    [columnName: string]: Column;
  };
  label?: string;
  authorizedRoles?: string[];
};

export type Tables = {
  [tableName: string]: Table;
};

export type FieldOptions = Record<string, unknown>;

export type KnexColumnInfo = {
  name: string;
  type: string;
  maxLength: number | null;
  nullable: boolean;
  defaultValue: string;
};

export type DBForeignKeyInfo = {
  table_schema: string;
  constraint_name: string;
  table_name: string;
  column_name: string;
  foreign_table_schema: string;
  foreign_table_name: string;
  foreign_column_name: string;
};

// Removed the schema bc we can't access information_schema.constraint_column_usage on supabase
export type ForeignKeyInfo = {
  constraintName: string | null;
  tableName: string;
  columnName: string;
  foreignTableName: string;
  foreignColumnName: string;
  foreignTableSchema: string | undefined;
  onUpdate: string | null;
  onDelete: string | null;
};

export type ColumnWithSourceInfo = {
  name: string;
  label: string;
  dataSourceInfo: Knex.ColumnInfo;
  primaryKey: boolean;
};

export interface ColumnWithForeignKeyInfo extends ColumnWithSourceInfo {
  foreignKeyInfo?: ForeignKeyInfo;
}

export interface ColumnWithBaseOptions extends ColumnWithForeignKeyInfo {
  baseOptions: BaseOptions;
}

export interface ColumnWithFieldType extends ColumnWithBaseOptions {
  fieldType: FieldType;
}

export interface ColumnWithFieldOptions extends ColumnWithFieldType {
  fieldOptions: FieldOptions;
}

export type ColumnWithStoredOptions = ColumnWithFieldOptions;

export type SqlColumnOptions = Knex.ColumnInfo;

export type DataSourceCredentials =
  | PostgresCredentials
  | MysqlCredentials
  | null;

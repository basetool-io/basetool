import { BaseOptions, Column, FieldType } from "@/features/fields/types";
import { DataSource } from "@prisma/client";
import { IQueryService } from "../types";
import { decrypt } from "@/lib/crypto";
import GoogleSheetsService from "./GoogleSheetsService";
import type { Knex } from "knex";

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
  // tableSchema: string;
  constraintName: string;
  tableName: string;
  columnName: string;
  // foreignTableSchema: string;
  foreignTableName: string;
  foreignColumnName: string;
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

export type PostgresqlDataSource = DataSource;
export type PostgresCredentials = {
  url: string;
  useSsl: boolean;
};

class QueryService implements IQueryService {
  public client;
  public spreadsheetId;

  public dataSource: PostgresqlDataSource;

  public queryResult: unknown = {};

  public options?: {
    queryParams?: {
      [name: string]: string;
    };
  };

  constructor({ dataSource }: { dataSource: PostgresqlDataSource }) {
    if (!dataSource || !dataSource.encryptedCredentials)
      throw new Error("No data source provided.");

    const credentialsAsAString = decrypt(dataSource.encryptedCredentials);

    if (!credentialsAsAString) throw new Error("No credentials on record.");

    let credentials: PostgresCredentials | null;

    try {
      credentials = JSON.parse(credentialsAsAString);
    } catch (error) {
      throw new Error("Failed to parse encrypted credentials");
    }

    const { tokens } = credentials;

    if (!credentials || !tokens) throw new Error("No credentials on record.");

    const connectionString = credentials.url;
    const connection: Knex.StaticConnectionConfig = {
      connectionString,
    };

    this.dataSource = dataSource;
    this.spreadsheetId = dataSource?.options?.spreadsheetId;
    this.client = new GoogleSheetsService(dataSource);
  }

  public async connect(): Promise<this> {
    // This client does not need to connect

    return this;
  }

  public async disconnect(): Promise<this> {
    // This client does not need to disconnect
    // this.client.destroy();

    return this;
  }

  /** Getters **/

  public async getTables(): Promise<{ name: string }[]> {
    return await this.client.getSheets(this.spreadsheetId as string);
  }

  public async getColumns(
    tableName: string,
    storedColumns?: Column[]
  ): Promise<Column[]> {
    return this.client.getColumns(this.spreadsheetId as string, tableName, [])
  }

  public async getRecordsCount(tableName: string): Promise<number> {
    return this.client.getRowCount(this.spreadsheetId as string, tableName);
  }

  public async getRecords({
    tableName,
    limit,
    offset,
    filters,
    orderBy,
    orderDirection,
  }: {
    tableName: string;
    filters: [];
    limit: number;
    offset: number;
    orderBy: string;
    orderDirection: string;
  }): Promise<[]> {
    return this.client.getRows(this.spreadsheetId as string, tableName)
  }

  public async getRecord(
    tableName: string,
    recordId: string
  ): Promise<unknown> {
    return "no";
  }

  public async createRecord(
    tableName: string,
    recordId: string,
    data: unknown
  ): Promise<number | string> {
    return "no";
  }

  public async updateRecord(
    tableName: string,
    recordId: string,
    data: unknown
  ): Promise<number | string> {
    return "no";
  }
}

export default QueryService;

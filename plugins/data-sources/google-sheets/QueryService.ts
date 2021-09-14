import { BaseOptions, Column, FieldType } from "@/features/fields/types";
import { GoogleSheetsCredentials, GoogleSheetsDataSource } from "./types";
import { GoogleSpreadsheet, GoogleSpreadsheetRow } from "google-spreadsheet";
import { IQueryService } from "../types";
import { decrypt, encrypt } from "@/lib/crypto";
import { isNull, isNumber, merge } from "lodash";
import { logger } from "@sentry/utils";
import GoogleSheetsService from "./GoogleSheetsService";
import cache from "@/features/cache";
import prisma from "@/prisma";
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

export type GoogleDataSourceOptions = {
  cache: boolean;
  expiresIn: number; // number of seconds
};

const CACHE_EXPIRATION_TIME = 10; // 15 minutes

class QueryService implements IQueryService {
  public client;
  public spreadsheetId;

  public dataSource: GoogleSheetsDataSource;

  public queryResult: unknown = {};

  public options?: GoogleDataSourceOptions;

  private doc: GoogleSpreadsheet | undefined;

  constructor({
    dataSource,
    options,
  }: {
    dataSource: GoogleSheetsDataSource;
    options?: GoogleDataSourceOptions;
  }) {
    // Set the default options
    this.options = merge(
      { cache: false, expiresIn: CACHE_EXPIRATION_TIME },
      options
    );

    if (!dataSource || !dataSource.encryptedCredentials)
      throw new Error("No data source provided.");

    // Set the datasource and spreadsheet
    this.dataSource = dataSource;
    this.spreadsheetId = dataSource?.options?.spreadsheetId;

    // Get the credentials
    const { tokens } = this.getDecryptedCredentials();

    if (!tokens) throw new Error("No credentials on record.");

    // Initialize the clien
    this.client = new GoogleSheetsService(dataSource);
  }

  public getDecryptedCredentials(): GoogleSheetsCredentials {
    const credentialsAsAString = decrypt(this.dataSource.encryptedCredentials);

    if (!credentialsAsAString) throw new Error("No credentials on record.");

    let credentials: GoogleSheetsCredentials | null;

    try {
      credentials = JSON.parse(credentialsAsAString);
    } catch (error) {
      throw new Error("Failed to parse encrypted credentials");
    }

    if (isNull(credentials)) throw new Error("No credentials on record");

    return credentials;
  }

  public async connect(): Promise<this> {
    // Initialize the sheet - doc ID is the long id in the sheets URL
    if (this.spreadsheetId) {
      this.doc = new GoogleSpreadsheet(this.spreadsheetId);

      // add authentication
      if (this.client.oauthClient) {
        this.doc.useOAuth2Client(this.client.oauthClient);
      }
    }

    return this;
  }

  private async loadInfo() {
    try {
      // loads document properties and worksheets
      await this.doc?.loadInfo();
    } catch (error: any) {
      if (
        error.message.includes(
          "No refresh token or refresh handler callback is set"
        )
      ) {
        await this.refreshToken();
        await this.doc?.loadInfo();
      }
    }
  }

  private async refreshToken() {
    const { tokens } = this.getDecryptedCredentials();

    // return 1
    const code = tokens.refresh_token;
    await this.client?.oauthClient?.getToken(code, async (err, newTokens) => {
      if (err) {
        console.error("Error getting oAuth tokens:");
        throw err;
      }
      const mergedTokens = merge(tokens, newTokens);
      const encryptedCredentials = encrypt(
        JSON.stringify({ tokens: mergedTokens })
      );
      const dataSource = await prisma.dataSource.update({
        where: { id: this.dataSource.id },
        data: {
          encryptedCredentials,
        },
      });
    });
  }

  public async disconnect(): Promise<this> {
    // This client does not need to disconnect

    return this;
  }

  /** Getters **/

  public async getTables(): Promise<{ name: string }[]> {
    await this.loadInfo();

    if (!this?.dataSource?.options?.spreadsheetId || !this.doc) return [];

    // Go through the provided sheets and return a commonly object
    const sheets = Object.entries(this.doc.sheetsByTitle).map(
      ([title, sheet]) => ({
        name: title,
      })
    );

    return sheets;
  }

  public async getColumns(
    tableName: string,
    storedColumns?: Column[]
  ): Promise<Column[]> {
    const key = `${this.dataSource.constructor.name}.getColumns({tableName:"${tableName}"})`;

    return await cache.fetch<Column[]>({
      key,
      options: {
        fresh: this?.options?.cache !== true,
        expiresIn: this.options?.expiresIn,
      },
      callback: async () => {
        await this.loadInfo();

        if (!this.doc) return [];

        const sheet = this.doc.sheetsByTitle[tableName];

        if (!sheet) return [];

        await sheet.loadHeaderRow();

        const convertedHeaders = sheet.headerValues.map((headerName) => ({
          name: headerName,
          label: headerName,
          fieldType: "Text",
          baseOptions: {
            visibility: ["index", "show", "edit", "new"],
            required: false,
            nullable: true,
            readonly: false,
            placeholder: "",
            help: "",
          },
          dataSourceInfo: {},
          fieldOptions: {},
        }));

        convertedHeaders.unshift({
          name: "id",
          label: "id",
          fieldType: "Id",
          primaryKey: true,
          baseOptions: {
            visibility: ["index", "show", "edit", "new"],
            required: false,
            nullable: true,
            readonly: false,
            placeholder: "",
            help: "",
          },
          dataSourceInfo: {},
          fieldOptions: {},
        });

        return convertedHeaders;
      },
    });
  }

  public async getRecordsCount(tableName: string): Promise<number> {
    await this.loadInfo();

    if (!this.doc) return 0;

    const sheet = this.doc.sheetsByTitle[tableName];
    const rows = await sheet.getRows();

    return rows.length;
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
    await this.loadInfo();

    if (!this.doc) return [];

    const sheet = this.doc.sheetsByTitle[tableName];
    const rawRows = await sheet.getRows();
    // console.log('rows->', rows)
    const rows = rawRows.map((row) => {
      return Object.fromEntries(
        Object.entries(row)
          .map(([key, value]) => {
            // Convert the rowNumber to an ID
            if (key === "_rowNumber") return ["id", value - 1];

            return [key, value];
          })
          .filter(([key, value]) => !key.startsWith("_")) // Remove private fields off the object
      );
    });

    return rows as [];
  }

  public async getRecord(
    tableName: string,
    recordId: string
  ): Promise<unknown> {
    await this.loadInfo();

    if (!this.doc) return [];

    const row = await this.getRow(tableName, parseInt(recordId) - 1);

    return Object.fromEntries(
      Object.entries(row)
        .map(([key, value]) => {
          // Convert the rowNumber to an ID
          if (key === "_rowNumber") return ["id", value - 1];

          return [key, value];
        })
        .filter(([key, value]) => !key.startsWith("_")) // Remove private fields off the object
    );
  }

  private async getRow(
    sheetName: string,
    id: number
  ): Promise<GoogleSpreadsheetRow | undefined> {
    await this.loadInfo();

    if (!this.doc) return;

    const sheet = this.doc.sheetsByTitle[sheetName];
    const rawRows = await sheet.getRows();

    // Subtract one. Array start from 0
    const row = rawRows[id];

    if (!row) return;

    return row;
  }

  public async createRecord(
    tableName: string,
    data: unknown
  ): Promise<string | undefined> {
    await this.loadInfo();

    if (!this.doc) return;

    const sheet = this.doc.sheetsByTitle[tableName];

    try {
      const response = await sheet.addRow(data as any);

      if (response instanceof GoogleSpreadsheetRow) {
        return (response._rowNumber - 1).toString();
      }
    } catch (error) {}

    return undefined;
  }

  public async updateRecord(
    tableName: string,
    recordId: string,
    data: unknown
  ): Promise<boolean | number | string | undefined> {
    await this.loadInfo();

    if (!this.doc) return;

    const row = await this.getRow(tableName, parseInt(recordId) - 1);

    if (!row) return;
    Object.entries(data as Record<string, unknown>).map(([key, value]) => {
      // Because the GoogleSpreadsheet library uses setters to set the data we can't dynamically assign the changes.
      // We're going to manually assign the change to _rawData.

      // Get index for column
      const columnIndex = row._sheet.headerValues.findIndex(
        (col: string) => col === key
      );
      // Use the columnIndex to set the data.
      if (isNumber(columnIndex)) {
        row._rawData[columnIndex] = value;
      }
    });

    try {
      await row.save();

      return true;
    } catch (error: any) {
      logger.error(error.message);

      return false;
    }
  }
}

export default QueryService;

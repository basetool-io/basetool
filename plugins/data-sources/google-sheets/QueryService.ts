import { BaseOptions, Column, FieldType } from "@/features/fields/types";
import { DataSource } from "@prisma/client";
import { GoogleSheetsCredentials, GoogleSheetsDataSource } from "./types";
import { GoogleSpreadsheet, GoogleSpreadsheetRow } from "google-spreadsheet";
import { IQueryService } from "../types";
import { OAuth2Client } from "google-auth-library";
import { decrypt, encrypt } from "@/lib/crypto";
import { isNull, isNumber, isUndefined, merge } from "lodash";
import { logger } from "@sentry/utils";
import GoogleDriveService from "./GoogleDriveService";
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

const CACHE_EXPIRATION_TIME = 900; // 15 minutes

class QueryService implements IQueryService {
  public client;
  public spreadsheetId;

  public dataSource: GoogleSheetsDataSource;

  public queryResult: unknown = {};

  public options?: GoogleDataSourceOptions;

  private doc: GoogleSpreadsheet | undefined;

  public oauthClient: OAuth2Client;

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
    const oauthClient = initOauthClient(this.dataSource);
    if (!oauthClient) throw new Error("Failed to initialize the OAuth client");
    this.oauthClient = oauthClient;

    // Initialize the clien
    this.client = new GoogleDriveService(dataSource);
  }

  public async connect(): Promise<this> {
    // Initialize the sheet - doc ID is the long id in the sheets URL
    if (this.spreadsheetId) {
      this.doc = new GoogleSpreadsheet(this.spreadsheetId);

      // add authentication
      const oauthClient = initOauthClient(this.dataSource);
      if (oauthClient) {
        this.oauthClient = oauthClient;
        this.doc.useOAuth2Client(oauthClient);
      }
    }

    return this;
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

        console.log('sheet.headerValues->', sheet.headerValues)
        const rawRows = await sheet.getRows();
        console.log('sheet.headerValues->', rawRows[1])

        const cells = await sheet.loadCells();
        console.log('cells->', cells)
        // for await (const header of sheet.headerValues) {
        //   console.log(header)


        // }

        sheet.headerValues.forEach((header, idx) => {
          console.log('header->', header)

          const cell = sheet.getCell(2, idx)

          if (header === 'Platform to publish') {
            console.log('cell->', cell._rawData.dataValidation.condition.values)

          }


        })


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
          primaryKey: false,
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

    if (!this.doc) return null;

    const row = await this.getRow(tableName, parseInt(recordId) - 1);

    if (!row) return null;

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
        await refreshTokens(this.dataSource, this.oauthClient);
        const oauthClient = initOauthClient(this.dataSource);
        if (oauthClient) {
          this.oauthClient = oauthClient;
          this.doc?.useOAuth2Client(oauthClient);
        }
        await this.doc?.loadInfo();
      }
    }
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
}

export const getDecryptedCredentials = (
  dataSource: DataSource
): GoogleSheetsCredentials => {
  if (
    isUndefined(dataSource?.encryptedCredentials) ||
    isNull(dataSource.encryptedCredentials)
  )
    throw new Error("No credentials on record.");

  const credentialsAsAString = decrypt(dataSource.encryptedCredentials);

  if (!credentialsAsAString) throw new Error("No credentials on record.");

  let credentials: GoogleSheetsCredentials | null;

  try {
    credentials = JSON.parse(credentialsAsAString);
  } catch (error) {
    throw new Error("Failed to parse encrypted credentials");
  }

  if (isNull(credentials)) throw new Error("No credentials on record");

  return credentials;
};

export const mergeAndEncryptCredentials = async (
  dataSource: DataSource,
  newCredentials: unknown
) => {
  const existingCredentials = getDecryptedCredentials(dataSource);

  const mergedCredentials = merge(existingCredentials, newCredentials);
  const encryptedCredentials = encrypt(JSON.stringify(mergedCredentials));
  await prisma.dataSource.update({
    where: { id: dataSource.id },
    data: {
      encryptedCredentials,
    },
  });
};

export const refreshTokens = async (
  dataSource: DataSource,
  oauthClient: OAuth2Client
) => {
  const { tokens } = getDecryptedCredentials(dataSource);

  const code = tokens.refresh_token;
  await oauthClient?.getToken(code, async (err: any, newTokens: any) => {
    if (err) {
      console.error("Error getting oAuth tokens:");
      throw err;
    }

    await mergeAndEncryptCredentials(dataSource, newTokens);
  });
};

export const initOauthClient = (
  dataSource: DataSource
): OAuth2Client | undefined => {
  if (!dataSource.encryptedCredentials) return;

  // Initialize the OAuth2Client with your app's oauth credentials
  const oauthClient = new OAuth2Client({
    clientId: process.env.GSHEETS_CLIENT_ID,
    clientSecret: process.env.GSHEETS_CLIENT_SECRET,
  });

  const credentialsAsAString = decrypt(dataSource.encryptedCredentials);

  if (!credentialsAsAString) throw new Error("No credentials on record.");

  let credentials: GoogleSheetsCredentials | null;

  try {
    credentials = JSON.parse(credentialsAsAString);
  } catch (error) {
    throw new Error("Failed to parse encrypted credentials.");
  }

  if (!credentials || !credentials.tokens)
    throw new Error("No credentials on record.");

  const { tokens } = credentials;

  oauthClient.credentials.access_token = tokens.access_token;
  oauthClient.credentials.refresh_token = tokens.refresh_token;
  oauthClient.credentials.expiry_date = tokens.expiry_date;

  // We should refresh the tokens when neccesarry
  oauthClient.on("tokens", async (newTokens) => {
    await mergeAndEncryptCredentials(dataSource, newTokens);
  });

  return oauthClient;
};
export default QueryService;

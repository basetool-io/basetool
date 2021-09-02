import { BaseOptions, Column, FieldType } from "@/features/fields/types";
import { DataSource } from "@prisma/client";
import { IQueryService } from "../types";
import { ListTable, PostgresqlColumnOptions } from "./types";
import { decrypt } from "@/lib/crypto"
import { getBaseOptions, idColumns } from "@/features/fields";
import { humanize } from "@/lib/humanize";
import { isEmpty, isUndefined, merge } from "lodash";
import { knex } from "knex";
import logger from "@/lib/logger";
import type { Knex } from "knex";

export type FieldOptions = Record<string, unknown>;

export type KnexColumnInfo = {
  name: string;
  type: string;
  maxLength: number | null;
  nullable: boolean;
  defaultValue: string;
};

export type ColumnWithSourceInfo = {
  name: string;
  label: string;
  fieldType: FieldType;
  dataSourceInfo: Knex.ColumnInfo;
  primaryKey: boolean;
};

export interface ColumnWithBaseOptions extends ColumnWithSourceInfo {
  baseOptions: BaseOptions;
}

export interface ColumnWithFieldOptions extends ColumnWithBaseOptions {
  fieldOptions: FieldOptions;
}

export type ColumnWithStoredOptions = ColumnWithFieldOptions;

export type PostgresqlDataSource = DataSource
export type PostgresCredentials = {
  url: string
  useSsl: boolean
}

class QueryService implements IQueryService {
  public client: Knex;

  public dataSource: PostgresqlDataSource;

  public queryResult: unknown = {};

  public options?: {
    queryParams?: {
      [name: string]: string;
    };
  };

  constructor({ dataSource }: { dataSource: PostgresqlDataSource }) {
    if (!dataSource || !dataSource.encryptedCredentials) throw new Error('No data source provided.')

    const credentialsAsAString = decrypt(dataSource.encryptedCredentials);

    if (!credentialsAsAString) throw new Error('No credentials on record.')

    let credentials: PostgresCredentials | null

    try {
      credentials = JSON.parse(credentialsAsAString)
    } catch (error) {
      throw new Error('Failed to parse encrypted credentials')
    }

    if (!credentials || !credentials.url) throw new Error('No credentials on record.')

    const connectionString = credentials.url
    const connection: Knex.StaticConnectionConfig = {
      connectionString,
    }

    if (credentials.useSsl) {
      connection.ssl = { rejectUnauthorized: false }
    }

    this.client = knex({
      client: "pg",
      connection,
    });

    this.dataSource = dataSource;
  }

  public async connect(): Promise<this> {
    // This client does not need to connect

    return this;
  }

  public async disconnect(): Promise<this> {
    // This client does not need to disconnect
    this.client.destroy();

    return this;
  }

  public async getRecords({
    tableName,
    limit,
    offset,
    orderBy,
    orderDirection,
  }: {
    tableName: string,
    filters: [],
    limit: number,
    offset: number,
    orderBy: string,
    orderDirection: string,
  }): Promise<[]> {
    const query = this.client
      .table(tableName)
      .limit(limit)
      .offset(offset)
      .select();

    if (orderBy) {
      query.orderBy(orderBy, orderDirection)
    }

    return query as unknown as [];
  }

  public async getRecordsCount(tableName: string): Promise<number> {
    const [{ count }] = await this.client.count().table(tableName);

    return parseInt(count as string, 10);
  }

  public async getRecord(
    tableName: string,
    recordId: string
  ): Promise<unknown> {
    const pk = await this.getPrimaryKeyColumn(tableName);

    if (!pk)
      throw new Error(`Can't find a primary key for table ${tableName}.`);

    const rows = await this.client
      .select()
      .where(pk, recordId)
      .table(tableName);

    return rows[0];
  }

  public async createRecord(
    tableName: string,
    recordId: string,
    data: unknown
  ): Promise<number | string> {
    const pk = await this.getPrimaryKeyColumn(tableName);

    if (!pk)
      throw new Error(`Can't find a primary key for table ${tableName}.`);

    const [id] = await this.client
      .table(tableName)
      .insert(data as any)
      .returning(pk);

    return id as string;
  }

  public async updateRecord(
    tableName: string,
    recordId: string,
    data: unknown
  ): Promise<unknown> {
    const pk = await this.getPrimaryKeyColumn(tableName);

    if (!pk)
      throw new Error(`Can't find a primary key for table ${tableName}.`);

    const result = await this.client
      .table(tableName)
      .update(data as any)
      .where(pk, recordId);

    return result;
  }

  public async getTables(): Promise<[]> {
    const query = `SELECT *
    FROM pg_catalog.pg_tables
    WHERE schemaname != 'pg_catalog' AND
        schemaname != 'information_schema';`;
    const getTableInfoQuery = (tables: string[]) => `SELECT
    table_name,
    column_name,
    data_type
  FROM
    information_schema.columns
    WHERE
      table_name
    IN (${tables.map((table) => `'${table}'`).join(",")});
    `;

    const {
      rows: rawTables,
    }: { rows: { tablename: string; schemaname: string }[] } =
      await this.client.raw(query);

    const tablesList = getTableInfoQuery(
      rawTables.map(({ tablename }) => tablename)
    );

    const {
      rows: columnsInfoResults,
    }: {
      rows: {
        table_name: string;
        column_name: string;
        data_type: string;
      }[];
    } = await this.client.raw(tablesList);
    const tables: ListTable[] = [];

    const columnsInfo: {
      [tableName: string]: { name: string; type: string }[];
    } = {};
    columnsInfoResults.forEach((tableInfo) => {
      if (!columnsInfo[tableInfo.table_name])
        columnsInfo[tableInfo.table_name] = [];

      const column = {
        name: tableInfo.column_name,
        type: tableInfo.data_type,
      };
      columnsInfo[tableInfo.table_name].push(column);
    });

    rawTables.forEach((tableInfo) => {
      tables.push({
        name: tableInfo.tablename,
        schemaname: tableInfo.schemaname,
      });
    });

    return tables as [];
  }

  public async getColumns(
    tableName: string,
    storedColumns?: Column[]
  ): Promise<[]> {
    const rawColumns = await this.client.table(tableName).columnInfo();
    const primaryKeyColumn = await this.getPrimaryKeyColumn(tableName);

    // turn knex column info to intermediate column (add dataSourceInfo)
    const columnsWithDataSourceInfo: ColumnWithSourceInfo[] = Object.entries(
      rawColumns
    ).map(([name, columnInfo]: [string, Knex.ColumnInfo]) => ({
      name,
      label: name, // this is dummy. We'll set the proper one later
      fieldType: getFieldTypeFromColumnInfo(name, columnInfo),
      dataSourceInfo: columnInfo,
      primaryKey: primaryKeyColumn === name,
    }));

    const baseOptions = getBaseOptions();

    // add default base options
    const columnsWithBaseOptions: ColumnWithBaseOptions[] =
      columnsWithDataSourceInfo.map((column) => ({
        ...column,
        baseOptions,
      }));

    const fieldOptionsByFieldName = await getDefaultFieldOptionsForFields(
      columnsWithBaseOptions
    );

    // add options stored in the database
    const columnsWithStoredOptions: ColumnWithStoredOptions[] =
      columnsWithBaseOptions.map((column) => {
        const storedColumn = !isUndefined(storedColumns)
          ? storedColumns[column.name as any]
          : undefined;
        const baseOptions = !isUndefined(storedColumn?.baseOptions)
          ? storedColumn?.baseOptions
          : {};
        const fieldOptions = !isUndefined(storedColumn?.fieldOptions)
          ? storedColumn?.fieldOptions
          : {};

        const newColumn = {
          ...column,
          baseOptions: {
            ...column.baseOptions,
            ...baseOptions,
          },
          fieldOptions: {
            ...fieldOptions,
          },
        };

        if (storedColumn?.fieldType) {
          newColumn.fieldType = storedColumn.fieldType;
        }

        return newColumn;
      });

    // add default field options for each type of field
    const columnsWithFieldOptions: ColumnWithFieldOptions[] =
      columnsWithStoredOptions.map((column) => {
        const fieldOptions = fieldOptionsByFieldName[column.name]
          ? fieldOptionsByFieldName[column.name]
          : {};

        return {
          ...column,
          fieldOptions: merge(fieldOptions, column.fieldOptions),
        };
      });

    const columns: Column<PostgresqlColumnOptions>[] =
      columnsWithFieldOptions.map((column) => ({
        ...column,
        label: getColumnLabel(column),
      }));

    // @todo: fetch foreign keys before responding
    return columns as [];
  }

  private async getPrimaryKeyColumn(
    tableName: string
  ): Promise<string | undefined> {
    const { rows } = await this.client
      .raw(`SELECT a.attname, format_type(a.atttypid, a.atttypmod) AS data_type
  FROM   pg_index i
  JOIN   pg_attribute a ON a.attrelid = i.indrelid
                       AND a.attnum = ANY(i.indkey)
  WHERE  i.indrelid = '${tableName}'::regclass
  AND    i.indisprimary;`);

    if (!isEmpty(rows)) {
      return rows[0].attname;
    }
  }
}

const getColumnLabel = (column: { name: string }) => {
  if (column.name === "id") return "ID";

  return humanize(column.name);
};

const getFieldTypeFromColumnInfo = (
  name: string,
  column: Knex.ColumnInfo
): FieldType => {
  switch (column.type) {
    default:
    case "boolean":
      return "Boolean";
    case "timestamp without time zone":
      return "DateTime";
    case "character varying":
      return "Text";
    case "json":
    case "text":
      return "Textarea";
    case "integer":
    case "bigint":
      if (idColumns.includes(name)) return "Id";

      return "Number";
  }
};

// @todo: optimize this to not query for the same field type twice (if you have two Text fields it will do that)
async function getDefaultFieldOptionsForFields(
  columns: { name: string; fieldType: FieldType }[]
): Promise<{ [fieldName: string]: Record<string, unknown> }> {
  const fieldOptionsTuple = await Promise.all(
    columns.map(async (column) => {
      try {
        const t = [
          column.name,
          (await import(`@/plugins/fields/${column.fieldType}/fieldOptions`))
            .default,
        ];

        return t;
      } catch (error) {
        if (!error.message.includes("Error: Cannot find module")) {
          logger.warn({
            msg: `Can't get the field options for '${column.name}' field.`,
            error,
          });
        }
      }
    })
  );

  return Object.fromEntries(
    fieldOptionsTuple.filter((tuple) => !isUndefined(tuple)) as any[]
  );
}

export default QueryService;

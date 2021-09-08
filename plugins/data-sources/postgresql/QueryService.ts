import { BaseOptions, Column, FieldType } from "@/features/fields/types";
import { DataSource } from "@prisma/client";
import { IFilter } from "@/features/tables/components/Filter";
import { IQueryService } from "../types";
import { ListTable, PostgresqlColumnOptions } from "./types";
import { StringFilterConditions } from "@/features/tables/components/StringConditionComponent";
import { camelCase, isEmpty, isUndefined } from "lodash";
import { decrypt } from "@/lib/crypto";
import { getBaseOptions, idColumns } from "@/features/fields";
import { humanize } from "@/lib/humanize";
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

// is = "is",
// is_not = "is_not",
// contains = "contains",
// not_contains = "not_contains",
// starts_with = "starts_with",
// ends_with = "ends_with",
// is_empty = "is_empty",
// is_not_empty = "is_not_empty",
const getCondition = (filter: IFilter) => {
  switch (filter.condition) {
    case "is":
      return "=";
    case StringFilterConditions.is_not:
      return "!=";
    case "contains":
      return "LIKE";
    case StringFilterConditions.not_contains:
      return "NOT LIKE";
    case StringFilterConditions.starts_with:
      return "LIKE";
    case StringFilterConditions.ends_with:
      return "LIKE";
    case StringFilterConditions.is_empty:
      return "LIKE";
    case StringFilterConditions.is_not_empty:
      return "LIKE";
    case ">":
      return ">";
    case ">=":
      return ">=";
    case "<":
      return "<";
    case "<=":
      return "<=";
  }

  return "=";
};

const getValue = (filter: IFilter) => {
  switch (filter.condition) {
    case "is":
    case StringFilterConditions.is_not:
    default:
      return filter.value;
    case "contains":
    case StringFilterConditions.not_contains:
      return `%${filter.value}%`;
    case StringFilterConditions.starts_with:
      return `%${filter.value}`;
    case StringFilterConditions.ends_with:
      return `${filter.value}%`;
    case StringFilterConditions.is_not_empty:
    case StringFilterConditions.is_empty:
      return ``;
  }

  return "=";
};
const addFilterToQuery = (query: Knex.QueryBuilder, filter: IFilter) => {
  // console.log(
  //   "addFilterToQuery->",
  //   filter.columnName,
  //   getCondition(filter),
  //   getValue(filter)
  // );
  query.where(filter.columnName, getCondition(filter), getValue(filter));
};

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

    if (!credentials || !credentials.url)
      throw new Error("No credentials on record.");

    const connectionString = credentials.url;
    const connection: Knex.StaticConnectionConfig = {
      connectionString,
    };

    if (credentials.useSsl) {
      connection.ssl = { rejectUnauthorized: false };
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
    const query = this.client.table(tableName);
    // @todo: bring in joins

    if (limit && offset) {
      query.limit(limit).offset(offset).select();
    }

    if (filters) {
      filters.forEach((filter) => addFilterToQuery(query, filter));
    }

    if (orderBy) {
      query.orderBy(`${tableName}.${orderBy}`, orderDirection);
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
    const foreignKeys = await this.getForeignKeys(tableName);
    const foreignKeysByColumnName = Object.fromEntries(
      foreignKeys.map((fk: ForeignKeyInfo) => [fk.columnName, fk])
    );

    // turn knex column info to intermediate column (add dataSourceInfo)
    const columnsWithDataSourceInfo: ColumnWithSourceInfo[] = Object.entries(
      rawColumns
    ).map(([name, columnInfo]: [string, Knex.ColumnInfo]) => ({
      name,
      label: name, // this is dummy. We'll set the proper one later
      dataSourceInfo: columnInfo,
      primaryKey: primaryKeyColumn === name,
    }));

    const columnsWithForeignKeyInfo: ColumnWithForeignKeyInfo[] =
      columnsWithDataSourceInfo.map((column: ColumnWithSourceInfo) => ({
        ...column,
        foreignKeyInfo: foreignKeysByColumnName[column.name],
      }));

    const baseOptions = getBaseOptions();

    // add default base options
    const columnsWithBaseOptions: ColumnWithBaseOptions[] =
      columnsWithForeignKeyInfo.map((column) => ({
        ...column,
        baseOptions,
      }));

    const columnsWithFieldType: ColumnWithFieldType[] =
      columnsWithBaseOptions.map((column) => ({
        ...column,
        fieldType: getFieldTypeFromColumnInfo(column),
      }));

    const fieldOptionsByFieldName = await getDefaultFieldOptionsForFields(
      columnsWithFieldType
    );

    // add default field options for each type of field
    const columnsWithFieldOptions: ColumnWithFieldOptions[] =
      columnsWithFieldType.map((column) => {
        const fieldOptions = fieldOptionsByFieldName[column.name]
          ? fieldOptionsByFieldName[column.name]
          : {};

        return {
          ...column,
          fieldOptions,
        };
      });

    // add options stored in the database
    const columnsWithStoredOptions: ColumnWithStoredOptions[] =
      columnsWithFieldOptions.map((column) => {
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
            ...column.fieldOptions,
            ...fieldOptions,
          },
        };

        if (storedColumn?.fieldType) {
          newColumn.fieldType = storedColumn.fieldType;
        }

        return newColumn;
      });

    const columns: Column<PostgresqlColumnOptions>[] =
      columnsWithStoredOptions.map((column) => ({
        ...column,
        label: getColumnLabel(column),
      }));

    // @todo: fetch foreign keys before responding
    return columns as [];
  }

  private async getPrimaryKeyColumn(
    tableName: string
  ): Promise<string | undefined> {
    const query = `SELECT a.attname, format_type(a.atttypid, a.atttypmod) AS data_type
    FROM   pg_index i
    JOIN   pg_attribute a ON a.attrelid = i.indrelid
                         AND a.attnum = ANY(i.indkey)
    WHERE  i.indrelid = ?::regclass
    AND    i.indisprimary;`;
    const { rows } = await this.client.raw(query, [tableName]);
    console.log("rows->", rows);

    if (!isEmpty(rows)) {
      return rows[0].attname;
    }
  }

  private async getForeignKeys(tableName: string): Promise<ForeignKeyInfo[]> {
    // We can't use this query bc we can't accss information_schema.constraint_column_usage in supabase
    //     const query = `SELECT
    //     tc.table_schema,
    //     tc.constraint_name,
    //     tc.table_name,
    //     kcu.column_name,
    //     ccu.table_schema AS foreign_table_schema,
    //     ccu.table_name AS foreign_table_name,
    //     ccu.column_name AS foreign_column_name
    // FROM
    //     information_schema.table_constraints AS tc
    //     JOIN information_schema.key_column_usage AS kcu
    //       ON tc.constraint_name = kcu.constraint_name
    //       AND tc.table_schema = kcu.table_schema
    //     JOIN information_schema.constraint_column_usage AS ccu
    //       ON ccu.constraint_name = tc.constraint_name
    //       AND ccu.table_schema = tc.table_schema
    // WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name=?;
    // `;

    const query = `
    WITH unnested_confkey AS (
      SELECT oid, unnest(confkey) as confkey
      FROM pg_constraint
    ),
    unnested_conkey AS (
      SELECT oid, unnest(conkey) as conkey
      FROM pg_constraint
    )
    select
      c.conname                   AS constraint_name,
      c.contype                   AS constraint_type,
      tbl.relname                 AS table_name,
      col.attname                 AS column_name,
      referenced_tbl.relname      AS foreign_table_name,
      referenced_field.attname    AS foreign_column_name,
      pg_get_constraintdef(c.oid) AS definition
    FROM pg_constraint c
    LEFT JOIN unnested_conkey con ON c.oid = con.oid
    LEFT JOIN pg_class tbl ON tbl.oid = c.conrelid
    LEFT JOIN pg_attribute col ON (col.attrelid = tbl.oid AND col.attnum = con.conkey)
    LEFT JOIN pg_class referenced_tbl ON c.confrelid = referenced_tbl.oid
    LEFT JOIN unnested_confkey conf ON c.oid = conf.oid
    LEFT JOIN pg_attribute referenced_field ON (referenced_field.attrelid = c.confrelid AND referenced_field.attnum = conf.confkey)
    WHERE c.contype = 'f' and tbl.relname = ?;
`;
    const { rows } = await this.client.raw(query, [tableName]);

    return rows.map((fk: ForeignKeyInfo) =>
      Object.fromEntries(
        Object.entries(fk).map(([key, value]) => [camelCase(key), value])
      )
    );
  }
}

const getColumnLabel = (column: { name: string }) => {
  if (column.name === "id") return "ID";

  return humanize(column.name);
};

const getFieldTypeFromColumnInfo = (
  column: ColumnWithBaseOptions
): FieldType => {
  if (column.foreignKeyInfo) {
    return "Association";
  }

  const { name } = column;
  switch (column.dataSourceInfo.type) {
    default:
    case "character":
    case "character varying":
    case "interval":
    case "name":
      return "Text";
    case "boolean":
    case "bit":
      return "Boolean";
    case "timestamp without time zone":
    case "timestamp with time zone":
    case "time without time zone":
    case "time with time zone":
    case "date":
      return "DateTime";
    case "json":
    case "jsonb":
      return "Json";
    case "text":
    case "xml":
    case "bytea":
      return "Textarea";
    case "integer":
    case "bigint":
    case "numeric":
    case "smallint":
    case "oid":
    case "uuid":
    case "real":
    case "double precision":
    case "money":
      if (idColumns.includes(name)) return "Id";
      else return "Number";
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
      } catch (error: any) {
        if (error.code !== "MODULE_NOT_FOUND") {
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

import {
  BooleanFilterConditions,
  DateFilterConditions,
  FilterVerbs,
  IntFilterConditions,
  SelectFilterConditions,
  StringFilterConditions,
} from "@/features/tables";
import {
  ClientOverrides,
  ColumnWithBaseOptions,
  ColumnWithFieldOptions,
  ColumnWithFieldType,
  ColumnWithForeignKeyInfo,
  ColumnWithSourceInfo,
  ColumnWithStoredOptions,
  DataSourceCredentials,
  ForeignKeyInfo,
  ISQLQueryService,
  QueryServiceFieldOptions,
  SQLDataSourceTypes,
  SqlColumnOptions,
} from "./types";
import { Column, FieldType } from "@/features/fields/types";
import { DataSource } from "@prisma/client";
import { IFilter, IFilterGroup } from "@/features/tables/types";
import { MysqlCredentials } from "../mysql/types";
import { PgCredentials } from "../postgresql/types";
import { SchemaInspector } from "knex-schema-inspector/dist/types/schema-inspector";
import { decrypt } from "@/lib/crypto";
import { getBaseOptions } from "@/features/fields";
import { getKnexClient } from "./getKnexClient";
import { humanize } from "@/lib/humanize";
import { isNumber, isUndefined } from "lodash";
import logger from "@/lib/logger";
import schemaInspector from "knex-schema-inspector";
import type { Knex } from "knex";

const getCondition = (filter: IFilter) => {
  switch (filter.condition) {
    case StringFilterConditions.contains:
    case StringFilterConditions.starts_with:
    case StringFilterConditions.ends_with:
    case StringFilterConditions.is_empty:
    case SelectFilterConditions.contains:
      return "LIKE";
    case StringFilterConditions.not_contains:
    case StringFilterConditions.is_not_empty:
    case SelectFilterConditions.not_contains:
      return "NOT LIKE";
    case IntFilterConditions.gt:
      return ">";
    case IntFilterConditions.gte:
      return ">=";
    case IntFilterConditions.lt:
      return "<";
    case IntFilterConditions.lte:
      return "<=";
    case StringFilterConditions.is_not:
    case IntFilterConditions.is_not:
    case SelectFilterConditions.is_not:
      return "!=";
    case StringFilterConditions.is:
    case IntFilterConditions.is:
    case SelectFilterConditions.is:
    default:
      return "=";
  }
};

const getValue = (filter: IFilter) => {
  switch (filter.condition) {
    case StringFilterConditions.contains:
    case StringFilterConditions.not_contains:
    case SelectFilterConditions.contains:
    case SelectFilterConditions.not_contains:
      return `%${filter.value}%`;
    case StringFilterConditions.starts_with:
      return `${filter.value}%`;
    case StringFilterConditions.ends_with:
      return `%${filter.value}`;
    case StringFilterConditions.is_not_empty:
    case StringFilterConditions.is_empty:
    case SelectFilterConditions.is_not_empty:
    case SelectFilterConditions.is_empty:
      return "";
    case BooleanFilterConditions.is_true:
      return "true";
    case BooleanFilterConditions.is_false:
      return "false";
    case StringFilterConditions.is:
    case StringFilterConditions.is_not:
    case IntFilterConditions.is:
    case IntFilterConditions.is_not:
    case IntFilterConditions.gt:
    case IntFilterConditions.gte:
    case IntFilterConditions.lt:
    case IntFilterConditions.lte:
    case SelectFilterConditions.is:
    case SelectFilterConditions.is_not:
    default:
      return filter.value || getDefaultFilterValue(filter);
  }
};

const getDefaultFilterValue = (filter: IFilter) => {
  switch (filter.column.fieldType) {
    case "Id":
    case "Number":
    case "Association":
      return 0;
    case "Boolean":
      return "true";
    case "DateTime":
      return new Date().toUTCString();
    case "Select":
      return "";
    default:
    case "Text":
      return "";
  }
};

const addFiltersToQuery = (
  query: Knex.QueryBuilder,
  filters: Array<IFilter | IFilterGroup>
) => {
  filters.forEach((filter) => {
    if ("isGroup" in filter && filter.isGroup) {
      addFilterGroupToQuery(query, filter as IFilterGroup);
    } else {
      addFilterToQuery(query, filter as IFilter);
    }
  });
};

const addFilterGroupToQuery = (
  query: Knex.QueryBuilder,
  filter: IFilterGroup
) => {
  if (filter.verb === FilterVerbs.or) {
    query.orWhere(function () {
      addFiltersToQuery(this, filter.filters);
    });
  } else {
    query.andWhere(function () {
      addFiltersToQuery(this, filter.filters);
    });
  }
};

const getDateRange = (
  filterOption: string,
  filterValue: string | undefined
) => {
  let today = new Date();
  let from, to;
  switch (filterOption) {
    case "today":
      today.setUTCHours(0, 0, 0, 0);
      from = today.toUTCString();
      today.setUTCHours(23, 59, 59, 999);
      to = today.toUTCString();

      return [from, to];
    case "tomorrow":
      today.setDate(today.getDate() + 1);
      today.setUTCHours(0, 0, 0, 0);
      from = today.toUTCString();
      today.setUTCHours(23, 59, 59, 999);
      to = today.toUTCString();

      return [from, to];
    case "yesterday":
      today.setDate(today.getDate() - 1);
      today.setUTCHours(0, 0, 0, 0);
      from = today.toUTCString();
      today.setUTCHours(23, 59, 59, 999);
      to = today.toUTCString();

      return [from, to];
    case "one_week_ago":
      today.setDate(today.getDate() - 7);
      today.setUTCHours(0, 0, 0, 0);
      from = today.toUTCString();
      today.setUTCHours(23, 59, 59, 999);
      to = today.toUTCString();

      return [from, to];
    case "one_week_from_now":
      today.setDate(today.getDate() + 7);
      today.setUTCHours(0, 0, 0, 0);
      from = today.toUTCString();
      today.setUTCHours(23, 59, 59, 999);
      to = today.toUTCString();

      return [from, to];
    case "one_month_ago":
      today.setMonth(today.getMonth() - 1);
      today.setUTCHours(0, 0, 0, 0);
      from = today.toUTCString();
      today.setUTCHours(23, 59, 59, 999);
      to = today.toUTCString();

      return [from, to];
    case "one_month_from_now":
      today.setMonth(today.getMonth() + 1);
      today.setUTCHours(0, 0, 0, 0);
      from = today.toUTCString();
      today.setUTCHours(23, 59, 59, 999);
      to = today.toUTCString();

      return [from, to];
    case "past_week":
      today.setUTCHours(0, 0, 0, 0);
      to = today.toUTCString();
      today.setDate(today.getDate() - 7);
      today.setUTCHours(0, 0, 0, 0);
      from = today.toUTCString();

      return [from, to];
    case "next_week":
      today.setUTCHours(0, 0, 0, 0);
      from = today.toUTCString();
      today.setDate(today.getDate() + 7);
      today.setUTCHours(0, 0, 0, 0);
      to = today.toUTCString();

      return [from, to];
    case "past_month":
      today.setUTCHours(0, 0, 0, 0);
      to = today.toUTCString();
      today.setMonth(today.getMonth() - 1);
      today.setUTCHours(0, 0, 0, 0);
      from = today.toUTCString();

      return [from, to];
    case "next_month":
      today.setUTCHours(0, 0, 0, 0);
      from = today.toUTCString();
      today.setMonth(today.getMonth() + 1);
      today.setUTCHours(0, 0, 0, 0);
      to = today.toUTCString();

      return [from, to];
    case "past_year":
      today.setUTCHours(0, 0, 0, 0);
      to = today.toUTCString();
      today.setFullYear(today.getFullYear() - 1);
      today.setUTCHours(0, 0, 0, 0);
      from = today.toUTCString();

      return [from, to];
    case "next_year":
      today.setUTCHours(0, 0, 0, 0);
      from = today.toUTCString();
      today.setFullYear(today.getFullYear() + 1);
      today.setUTCHours(0, 0, 0, 0);
      to = today.toUTCString();

      return [from, to];
    case "exact_date":
      if (filterValue != "" && filterValue != undefined) {
        today = new Date(filterValue);
      }
      today.setUTCHours(0, 0, 0, 0);
      from = today.toUTCString();
      today.setUTCHours(23, 59, 59, 999);
      to = today.toUTCString();

      return [from, to];
    default:
      return [null, null];
  }
};

const addFilterToQuery = (query: Knex.QueryBuilder, filter: IFilter) => {
  const NULL_FILTERS = [
    StringFilterConditions.is_null,
    IntFilterConditions.is_null,
    BooleanFilterConditions.is_null,
    DateFilterConditions.is_null,
    SelectFilterConditions.is_null,
  ];

  const NOT_NULL_FILTERS = [
    StringFilterConditions.is_not_null,
    IntFilterConditions.is_not_null,
    BooleanFilterConditions.is_not_null,
    DateFilterConditions.is_not_null,
    SelectFilterConditions.is_not_null,
  ];

  if (NULL_FILTERS.includes(filter.condition)) {
    if (filter.verb === FilterVerbs.or) {
      query.orWhereNull(filter.columnName);
    } else {
      query.whereNull(filter.columnName);
    }
  } else if (NOT_NULL_FILTERS.includes(filter.condition)) {
    if (filter.verb === FilterVerbs.or) {
      query.orWhereNotNull(filter.columnName);
    } else {
      query.whereNotNull(filter.columnName);
    }
  } else if (filter.column.fieldType === "DateTime") {
    if ("option" in filter && filter.option) {
      const dateRange = getDateRange(filter.option, filter.value);
      if (filter.verb === FilterVerbs.or) {
        switch (filter.condition) {
          case DateFilterConditions.is:
          case DateFilterConditions.is_within:
            query.orWhereBetween(filter.columnName, [
              dateRange[0],
              dateRange[1],
            ]);
            break;
          case DateFilterConditions.is_not:
            query.orWhereNotBetween(filter.columnName, [
              dateRange[0],
              dateRange[1],
            ]);
            break;
          case DateFilterConditions.is_before:
            query.orWhere(filter.columnName, "<", dateRange[0]);
            break;
          case DateFilterConditions.is_after:
            query.orWhere(filter.columnName, ">", dateRange[1]);
            break;
          case DateFilterConditions.is_on_or_before:
            query.orWhere(filter.columnName, "<=", dateRange[1]);
            break;
          case DateFilterConditions.is_on_or_after:
            query.orWhere(filter.columnName, ">=", dateRange[0]);
            break;
          default:
            query.orWhere(
              filter.columnName,
              getCondition(filter),
              getValue(filter)
            );
            break;
        }
      } else {
        switch (filter.condition) {
          case DateFilterConditions.is:
          case DateFilterConditions.is_within:
            query.whereBetween(filter.columnName, [dateRange[0], dateRange[1]]);
            break;
          case DateFilterConditions.is_not:
            query.whereNotBetween(filter.columnName, [
              dateRange[0],
              dateRange[1],
            ]);
            break;
          case DateFilterConditions.is_before:
            query.where(filter.columnName, "<", dateRange[0]);
            break;
          case DateFilterConditions.is_after:
            query.where(filter.columnName, ">", dateRange[1]);
            break;
          case DateFilterConditions.is_on_or_before:
            query.where(filter.columnName, "<=", dateRange[1]);
            break;
          case DateFilterConditions.is_on_or_after:
            query.where(filter.columnName, ">=", dateRange[0]);
            break;
          default:
            query.where(
              filter.columnName,
              getCondition(filter),
              getValue(filter)
            );
            break;
        }
      }
    }
  } else {
    if (filter.verb === FilterVerbs.or) {
      query.orWhere(filter.columnName, getCondition(filter), getValue(filter));
    } else {
      query.where(filter.columnName, getCondition(filter), getValue(filter));
    }
  }
};

abstract class AbstractQueryService implements ISQLQueryService {
  public client!: Knex;

  public inspector!: SchemaInspector;

  public dataSource: DataSource;

  public dataSourceType: SQLDataSourceTypes;

  public options?: {
    queryParams?: {
      [name: string]: string;
    };
  };

  constructor({ dataSource }: { dataSource: DataSource }) {
    if (!dataSource) throw new Error("No data source provided.");

    this.dataSource = dataSource;
    this.dataSourceType = dataSource.type as SQLDataSourceTypes;

    this.setClient();
  }

  public getClient(overrides?: ClientOverrides): Knex {
    const credentials = this.getCredentials();

    return getKnexClient(this.dataSourceType, credentials, overrides);
  }

  public setClient(client?: Knex): this {
    if (client) {
      this.client = client;
    } else {
      this.client = this.getClient();
    }

    this.inspector = schemaInspector(this.client);

    return this;
  }

  /**
   * Update the client with overrides
   */
  public updateClient(overrides: ClientOverrides): this {
    const client = this.getClient(overrides);

    return this.setClient(client);
  }

  public getSSHCredentials(): DataSourceCredentials {
    return this.getParsedSSHCredentials();
  }

  public getParsedCredentials(): DataSourceCredentials {
    if (!this.dataSource.encryptedCredentials)
      throw new Error("No credentials provided.");

    return parseEncryptedString(this.dataSource.encryptedCredentials);
  }

  public getParsedSSHCredentials(): DataSourceCredentials {
    if (!this.dataSource.encryptedSSHCredentials)
      throw new Error("No SSH credentials provided.");

    return parseEncryptedString(this.dataSource.encryptedSSHCredentials);
  }

  public async connect(): Promise<this> {
    // This client type does not need to connect

    return this;
  }

  public async disconnect(): Promise<this> {
    await this.client.destroy();

    return this;
  }

  public async getRecord({
    tableName,
    recordId,
  }: {
    tableName: string;
    recordId: string;
  }): Promise<Record<string, unknown> | undefined> {
    const pk = await this.getPrimaryKeyColumn({ tableName });

    if (!pk)
      throw new Error(`Can't find a primary key for table ${tableName}.`);

    const rows = await this.client
      .select()
      .where(pk, recordId)
      .table(tableName);

    return rows[0]
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
    filters: Array<IFilter | IFilterGroup>;
    limit?: number;
    offset?: number;
    orderBy: string;
    orderDirection: string;
  }): Promise<[]> {
    const query = this.client.table(tableName);

    if (isNumber(limit) && isNumber(offset)) {
      query.limit(limit).offset(offset).select();
    }

    if (filters) {
      addFiltersToQuery(query, filters);
    }

    if (orderBy) {
      query.orderBy(`${tableName}.${orderBy}`, orderDirection);
    }

    return await query as [];
  }

  public async getRecordsCount({
    tableName,
    filters,
  }: {
    tableName: string;
    filters: Array<IFilter | IFilterGroup>;
  }): Promise<number> {
    const query = this.client.table(tableName);
    if (filters) {
      addFiltersToQuery(query, filters);
    }
    const [{ count }] = await query.count("*", { as: "count" });

    return parseInt(count as string, 10);
  }

  public async createRecord({
    tableName,
    data,
  }: {
    tableName: string;
    data: unknown;
  }): Promise<string | undefined> {
    const pk = await this.getPrimaryKeyColumn({ tableName });

    if (!pk)
      throw new Error(`Can't find a primary key for table ${tableName}.`);

    const [id] = await this.client
      .table(tableName)
      .insert(data as any)
      .returning(pk);

    return id as string;
  }

  public async updateRecord({
    tableName,
    recordId,
    data,
  }: {
    tableName: string;
    recordId: string;
    data: unknown;
  }): Promise<unknown> {
    const pk = await this.getPrimaryKeyColumn({ tableName });

    if (!pk)
      throw new Error(`Can't find a primary key for table ${tableName}.`);

    const result = await this.client
      .table(tableName)
      .update(data as any)
      .where(pk, recordId);

    return result;
  }

  public async deleteRecord({
    tableName,
    recordId,
  }: {
    tableName: string;
    recordId: string;
  }): Promise<unknown> {
    const pk = await this.getPrimaryKeyColumn({ tableName });

    if (!pk)
      throw new Error(`Can't find a primary key for table ${tableName}.`);

    const result = await this.client
      .table(tableName)
      .delete()
      .where(pk, recordId);

    return result;
  }

  public async deleteRecords({
    tableName,
    recordIds,
  }: {
    tableName: string;
    recordIds: number[];
  }): Promise<unknown> {
    const pk = await this.getPrimaryKeyColumn({ tableName });

    if (!pk)
      throw new Error(`Can't find a primary key for table ${tableName}.`);

    const result = await this.client
      .table(tableName)
      .delete()
      .whereIn(pk, recordIds);

    return result;
  }

  public async getTables(): Promise<[]> {
    return (await this.inspector.tableInfo()) as [];
  }

  public async getColumns({
    tableName,
    storedColumns,
  }: {
    tableName: string;
    storedColumns?: Column[];
  }): Promise<[]> {
    const rawColumns = await this.client.table(tableName).columnInfo();
    const primaryKeyColumn = await this.getPrimaryKeyColumn({ tableName });
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
      columnsWithBaseOptions.map((column) => {
        const storedColumn = !isUndefined(storedColumns)
          ? storedColumns[column.name as any]
          : undefined;

        // Try and find if the user defined this type in the DB
        const baseOptionsFromColumnInfo =
          this.getFieldOptionsFromColumnInfo(column);
        const fieldType =
          storedColumn?.fieldType || baseOptionsFromColumnInfo.fieldType;

        return {
          ...column,
          fieldType,
        };
      });

    // refactor to get all options for field type not for field name
    const fieldOptionsByFieldName = await getDefaultFieldOptionsForFields(
      columnsWithFieldType
    );

    // add default field options for each type of field
    const columnsWithFieldOptions: ColumnWithFieldOptions[] =
      columnsWithFieldType.map((column) => {
        const defaultFieldOptions = fieldOptionsByFieldName[column.name]
          ? fieldOptionsByFieldName[column.name]
          : {};
        const baseOptionsFromColumnInfo =
          this.getFieldOptionsFromColumnInfo(column);

        const fieldOptions = {
          ...defaultFieldOptions,
          ...baseOptionsFromColumnInfo?.fieldOptions,
        };

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

        return newColumn;
      });

    const columns: Column<SqlColumnOptions>[] = columnsWithStoredOptions.map(
      (column) => ({
        ...column,
        label: getColumnLabel(column),
      })
    );

    // Filter out fields that are unsupported.
    const supportedColumns = this.filterOutUnsupportedColumns(columns);

    // @todo: fetch foreign keys before responding
    return supportedColumns as [];
  }

  public filterOutUnsupportedColumns(columns: Column<SqlColumnOptions>[]) {
    return columns;
  }

  private async getPrimaryKeyColumn({
    tableName,
  }: {
    tableName: string;
  }): Promise<string | undefined> {
    const columnInfo = await this.inspector.columnInfo(tableName);

    return columnInfo.find(({ is_primary_key }) => is_primary_key === true)
      ?.name;
  }

  private async getForeignKeys(tableName: string): Promise<ForeignKeyInfo[]> {
    const foreignKeys = (await this.inspector.foreignKeys())
      .filter(({ table }) => table === tableName)
      .map((fkInfo) => ({
        constraintName: fkInfo.constraint_name,
        tableName: fkInfo.table,
        columnName: fkInfo.column,
        foreignTableName: fkInfo.foreign_key_table,
        foreignColumnName: fkInfo.foreign_key_column,
        foreignTableSchema: fkInfo.foreign_key_schema,
        onUpdate: fkInfo.on_update,
        onDelete: fkInfo.on_delete,
      }));

    return foreignKeys;
  }

  abstract getFieldOptionsFromColumnInfo(
    column: ColumnWithBaseOptions
  ): QueryServiceFieldOptions;
  public abstract getCredentials(): PgCredentials | MysqlCredentials;
}

const getColumnLabel = (column: { name: string }) => {
  if (column.name === "id") return "ID";

  return humanize(column.name);
};

// @todo: optimize this to not query for the same field type twice (if you have two Text fields it will do that)
async function getDefaultFieldOptionsForFields(
  columns: { name: string; fieldType: FieldType }[]
): Promise<{ [fieldName: string]: Record<string, unknown> }> {
  const fieldOptionsTuple = await Promise.all(
    columns.map(async (column) => {
      try {
        return [
          column.name,
          (await import(`@/plugins/fields/${column.fieldType}/fieldOptions`))
            .default,
        ];
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

const parseEncryptedString = (
  encryptedString: string
): Record<string, unknown> => {
  const credentialsAsAString = decrypt(encryptedString);

  if (!credentialsAsAString) throw new Error("No credentials on record.");

  let credentials: DataSourceCredentials;

  try {
    credentials = JSON.parse(credentialsAsAString);
  } catch (error) {
    throw new Error("Failed to parse encrypted credentials");
  }

  return credentials;
};

export default AbstractQueryService;

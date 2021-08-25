import ApiResponse from '@/features/api/ApiResponse'
import { DataSource } from "@prisma/client";
import { DataSourceTypes } from "../enums";
// import ApiResponse from '@/src/services/ApiResponse'
// import DataSource from '@/types/app-state/DataSource'
import type { AbstractQueryService } from "../types";
import { Client } from "pg";
import { ListTable } from "./types";
import {
  Column,
  DefaultEntry,
  FieldType,
  ForeignKey,
  IntermediateColumn,
  NullableEntry,
  RawColumn,
} from "@/features/fields/types";
import { Views } from "@/features/fields/enums";
import { humanize } from "@/lib/humanize";
import { idColumns } from "@/features/fields";
import { isEmpty } from "lodash";

export interface PostgresqlDataSource extends DataSource {
  options: {
    url: string;
  };
}

// export interface PostgresqlDataQuery extends DataQuery {
//   options: {
//     query: string
//   }
// }

class QueryService implements AbstractQueryService {
  public client: Client;

  public dataSource: PostgresqlDataSource;

  // public stateDataQuery: PostgresqlDataQuery | undefined;

  public queryResult: unknown = {};

  public options?: {
    queryParams?: {
      [name: string]: string;
    };
  };

  constructor({ dataSource }: { dataSource: PostgresqlDataSource }) {
    const connectionString = dataSource?.options?.url;
    console.log("connectionString->", dataSource);

    this.client = new Client({
      connectionString,
    });
    this.dataSource = dataSource;
  }

  public async connect() {
    await this.client.connect();
  }

  public async getTables(): Promise<ListTable[]> {
    console.log("in getTables");
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
      await this.client.query(query);
    console.log("rawTables->", rawTables);

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
    } = await this.client.query(tablesList);
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

    return tables;
  }

  public async getRecords(tableName: string): Promise<ListTable[]> {
    return this.getRows(`SELECT * FROM ${tableName}`);
  }

  public async getRecord(
    tableName: string,
    recordId: string
  ): Promise<ListTable[]> {
    const rows = await this.getRows(
      `SELECT * FROM ${tableName} WHERE id = ${recordId} LIMIT 1`
    );

    return rows[0];
  }

  public async createRecord(
    tableName: string,
    recordId: string,
    primaryKey: string,
    columns: [],
    values: []
  ): Promise<ListTable[]> {
    const records = await this.getRows(
      `INSERT INTO ${tableName} (${columns.join(",")}) VALUES (${values.join(
        ","
      )}) RETURNING ${primaryKey};`
    );
    console.log("records->", records);

    return records[0];
  }

  public async updateRecord(
    tableName: string,
    recordId: string,
    payload: unknown
  ): Promise<ListTable[]> {
    return this.getRows(
      `UPDATE ${tableName} SET ${payload} WHERE id = ${recordId}`
    );
  }

  public async getColumns(
    tableName: string,
    storedColumns?: Column[]
  ): Promise<[]> {
    let columns = await this.getColumnsFromTable(tableName);
    const primaryKey = await this.getPrimaryKey(tableName);
    const foreignKeys = await this.getForeignKeys(tableName);
    const nullableFields = await this.getNullableFields(tableName);
    const defaultValues = await this.getDefaultValues(tableName);

    // Mark the primary key column
    if (!isEmpty(primaryKey)) {
      columns = columns.map((column) => {
        if (primaryKey[0].attname === column.name) {
          return {
            ...column,
            primaryKey: true,
          };
        }

        return column;
      });
    }

    // Add the foreign keys to columns
    if (!isEmpty(foreignKeys)) {
      const foreignKeysByColumnName = Object.fromEntries(
        foreignKeys.map((fk: ForeignKey) => [fk.column_name, fk])
      );

      columns = columns.map((column) => {
        if (foreignKeysByColumnName[column.name]) {
          return {
            ...column,
            foreignKey: foreignKeysByColumnName[column.name],
          };
        }

        return column;
      });
    }

    // Add the foreign keys to columns
    if (!isEmpty(nullableFields)) {
      const nullableFieldsByColumnName = Object.fromEntries(
        nullableFields.map((field: NullableEntry) => [field.column_name, field])
      );

      columns = columns.map((column) => {
        if (nullableFieldsByColumnName[column.name]) {
          return {
            ...column,
            nullable:
              nullableFieldsByColumnName[column.name].nullable ===
              "is nullable",
          };
        }

        return column;
      });
    }

    // Add the default values to columns
    if (!isEmpty(defaultValues)) {
      const defaultValuesByColumnName = Object.fromEntries(
        defaultValues.map((field: DefaultEntry) => [field.column_name, field])
      );

      columns = columns.map((column) => {
        if (defaultValuesByColumnName[column.name]) {
          return {
            ...column,
            columnDefault:
              defaultValuesByColumnName[column.name].column_default,
          };
        }

        return column;
      });
    }

    if (storedColumns) {
      columns = columns.map((column: Column) => {
        const storedColumn: Column = storedColumns[column.name as any];

        if (storedColumn) {
          return {
            ...column,
            ...storedColumn,
          };
        }

        return column;
      });
    }

    return columns as [];
  }

  // ---

  get dataQuery(): PostgresqlDataQuery {
    if (!this.stateDataQuery) throw Error("No data query present");

    return this.stateDataQuery;
  }

  public setQuery(dataQuery: PostgresqlDataQuery) {
    this.stateDataQuery = dataQuery;

    return this;
  }

  public setOptions(options: object) {
    this.options = options;

    return this;
  }

  public async runQuery() {
    if (!this.dataQuery) throw Error("No data query present");

    this.queryResult = await this.client.$queryRaw(
      this.dataQuery.options.query
    );

    return this;
  }

  public toJson() {
    return {
      data: this.queryResult,
      metadata: {},
      dataSourceType: DataSourceTypes.postgresql,
    };
  }

  public async toApiResponse() {
    return ApiResponse.withData(this.toJson());
  }

  /**
   * disconnect
   */
  public async disconnect() {
    return await this.client.end();
  }

  private async getRows(query: string) {
    const { rows } = await this.client.query(query);

    return rows;
  }

  private async getDefaultValues(tableName: string) {
    return this.getRows(`SELECT column_name, column_default
FROM information_schema.columns
WHERE (table_schema, table_name) = ('public', '${tableName}')
ORDER BY ordinal_position;
`);
  }

  private async getNullableFields(tableName: string) {
    return this.getRows(`select c.table_schema,
  c.table_name,
  c.column_name,
  case c.is_nullable
       when 'NO' then 'not nullable'
       when 'YES' then 'is nullable'
  end as nullable
from information_schema.columns c
join information_schema.tables t
on c.table_schema = t.table_schema
and c.table_name = t.table_name
where c.table_schema not in ('pg_catalog', 'information_schema')
 and t.table_type = 'BASE TABLE'
 and t.table_name = '${tableName}'
order by table_schema,
    table_name,
    column_name;`);
  }

  private async getForeignKeys(tableName: string) {
    return this.getRows(`SELECT
  tc.table_schema,
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_schema AS foreign_table_schema,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM
  information_schema.table_constraints AS tc
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='${tableName}';`);
  }

  private async getPrimaryKey(tableName: string) {
    return this
      .getRows(`SELECT a.attname, format_type(a.atttypid, a.atttypmod) AS data_type
  FROM   pg_index i
  JOIN   pg_attribute a ON a.attrelid = i.indrelid
                       AND a.attnum = ANY(i.indkey)
  WHERE  i.indrelid = '${tableName}'::regclass
  AND    i.indisprimary;`);
  }

  private async getColumnsFromTable(tableName: string): Promise<Column[]> {
    const columnsInfoResults: RawColumn[] = await this.getRows(`SELECT
  table_name,
  column_name,
  data_type
FROM
  information_schema.columns
  WHERE
    table_name = '${tableName}';`);

    return columnsInfoResults.map((rawColumn) =>
      hydrateColumns(rawColumnToColumn(rawColumn))
    );
  }
}

const rawColumnToColumn = (rawColumn: RawColumn): IntermediateColumn => ({
  name: rawColumn.column_name,
  fieldType: parseFieldType(rawColumn),
  dataType: rawColumn.data_type,
});

const hydrateColumns = (column: Column | IntermediateColumn): Column => ({
  visibility: [Views.index, Views.show, Views.edit, Views.new],
  label: getColumnLabel(column),
  required: "required" in column && column?.required === true,
  nullable: "nullable" in column && column?.nullable === true,
  ...column,
});

const getColumnLabel = (column: Column | IntermediateColumn) => {
  if (column.name === "id") return "ID";

  return humanize(column.name);
};

const parseFieldType = (column: RawColumn): FieldType => {
  switch (column.data_type) {
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
      if (idColumns.includes(column.column_name)) return "Id";

      return "Number";
  }
};
export default QueryService

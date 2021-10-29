import {
  ColumnWithBaseOptions,
  QueryServiceFieldOptions,
} from "../abstract-sql-query-service/types";
import { FieldType } from "@/features/fields/types";
import { MysqlCredentials } from "../mysql/types";
import { idColumns } from "@/features/fields";
import { knex } from "knex";
import AbstractQueryService from "../abstract-sql-query-service/AbstractQueryService";
import type { Knex } from "knex";

class QueryService extends AbstractQueryService {
  public getCredentials() {
    const credentials = this.getParsedCredentials() as MysqlCredentials;

    if (!credentials || !credentials.host)
      throw new Error("No credentials on record.");

    return credentials;
  }

  getClient(): Knex {
    const credentials = this.getCredentials();

    const connection: Knex.StaticConnectionConfig = {
      host: credentials.host,
      port: credentials.port,
      database: credentials.database,
      user: credentials.user,
      password: credentials.password,
    };

    if (credentials.useSsl) {
      connection.ssl = { rejectUnauthorized: false };
    }

    const client = knex({
      client: "mssql",
      connection,
      debug: false,
    });

    return client;
  }

  public getFieldOptionsFromColumnInfo(
    column: ColumnWithBaseOptions
  ): QueryServiceFieldOptions {
    const fieldOptions: Record<string, unknown> = {};
    let fieldType: FieldType = "Text";

    const { name } = column;
    switch (column.dataSourceInfo.type) {
      case "char":
      case "varchar":
      case "binary":
      case "varbinary":
        fieldType = "Text";
        break;

      case "text":
      case "nchar":
      case "nvarchar":
        fieldType = "Textarea";
        break;

      case "enum":
        fieldType = "Select";
        break;

      case "bit":
        fieldType = "Boolean";
        break;

      case "datetime":
      case "datetime2":
      case "smalldatetime":
      case "date":
      case "time":
      case "timestamp":
      case "datetimeoffset":
        fieldType = "DateTime";
        break;

      case "json":
        fieldType = "Json";
        break;

      case "int":
      case "tinyint":
      case "smallint":
      case "int":
      case "bigint":
      case "double":
      case "numeric":
      case "smallmoney":
      case "money":
      case "float":
      case "real":
        if (idColumns.includes(name)) {
          fieldType = "Id";
        } else {
          fieldType = "Number";
        }
        break;
    }

    if (column.foreignKeyInfo) {
      fieldType = "Association";
    }

    return { fieldType, fieldOptions };
  }
}

export default QueryService;

import { ColumnWithBaseOptions } from "../abstract-sql-query-service/types";
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

  public getFieldTypeFromColumnInfo(column: ColumnWithBaseOptions): FieldType {
    if (column.foreignKeyInfo) {
      return "Association";
    }

    const { name } = column;
    switch (column.dataSourceInfo.type) {
      default:
      case "char":
      case "varchar":
      case "binary":
      case "varbinary":
        return "Text";

      case "text":
      case "nchar":
      case "nvarchar":
        return "Textarea";

      case "enum":
        return "Select";

      case "bit":
        return "Boolean";

      case "datetime":
      case "datetime2":
      case "smalldatetime":
      case "date":
      case "time":
      case "timestamp":
      case "datetimeoffset":
        return "DateTime";

      case "json":
        return "Json";

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
        if (idColumns.includes(name)) return "Id";
        else return "Number";
    }
  }
}

export default QueryService;

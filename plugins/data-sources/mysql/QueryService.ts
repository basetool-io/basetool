import { ColumnWithBaseOptions } from "../abstract-sql-query-service/types";
import { FieldType } from "@/features/fields/types";
import { MysqlCredentials } from "./types";
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

    return QueryService.initClient(credentials);
  }

  static initClient(credentials: MysqlCredentials) {
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
      client: "mysql",
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
      case "tinyblob":
      case "tinytext":
      case "enum":
      case "set":
        return "Text";

      case "enum":
        return "Select";

      case "tinyint":
      case "bit":
        return "Boolean";

      case "date":
      case "datetime":
      case "timestamp":
      case "time":
      case "year":
        return "DateTime";

      case "json":
        return "Json";

      case "blob":
      case "text":
      case "mediumblob":
      case "mediumtext":
      case "longblob":
      case "longtext":
        return "Textarea";

      case "int":
      case "smallint":
      case "mediumint":
      case "bigint":
      case "float":
      case "double":
      case "decimal":
      case "numeric":
        if (idColumns.includes(name)) return "Id";
        else return "Number";
    }
  }
}

export default QueryService;

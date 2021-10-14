import { ColumnWithBaseOptions } from "../abstract-sql-query-service/types";
import { FieldType } from "@/features/fields/types";
import { PostgresCredentials } from "./types";
import { idColumns } from "@/features/fields";
import { knex } from "knex";
import AbstractQueryService from "../abstract-sql-query-service/AbstractQueryService";
import type { Knex } from "knex";

class QueryService extends AbstractQueryService {
  public getCredentials() {
    const credentials = this.getParsedCredentials() as PostgresCredentials;

    if (!credentials || !credentials.url)
      throw new Error("No credentials on record.");

    return credentials;
  }

  getClient(): Knex {
    const credentials = this.getCredentials();

    return QueryService.initClient(credentials);
  }

  static initClient(credentials: PostgresCredentials) {
    const connectionString = credentials.url;
    const connection: Knex.StaticConnectionConfig = {
      connectionString,
    };

    if (credentials.useSsl) {
      connection.ssl = { rejectUnauthorized: false };
    }

    const client = knex({
      client: "pg",
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
  }
}

export default QueryService;

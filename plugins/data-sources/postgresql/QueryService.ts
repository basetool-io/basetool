import { ColumnWithBaseOptions } from "../abstract-sql-query-service/types";
import { FieldType } from "@/features/fields/types";
import { PgCredentials, PgLegacyCredentials } from "./types";
import { idColumns } from "@/features/fields";
import AbstractQueryService from "../abstract-sql-query-service/AbstractQueryService";
import URI from "urijs";

class QueryService extends AbstractQueryService {
  public getCredentials(): PgCredentials {
    const parsedCredentials = this.getParsedCredentials() as
      | PgCredentials
      | PgLegacyCredentials;

    if (!parsedCredentials || Object.keys(parsedCredentials).length === 0)
      throw new Error("No credentials on record.");
    let credentials;

    // If this is a legacy connection, break apart the connection string to regular credentials
    if ("url" in parsedCredentials) {
      const uri = URI(parsedCredentials.url);
      credentials = {
        host: uri.hostname(),
        port: parseInt(uri.port()),
        database: uri.path().replace("/", ""),
        user: uri.username(),
        password: uri.password(),
        useSsl: parsedCredentials.useSsl,
      };
    } else {
      credentials = parsedCredentials;
    }

    return credentials;
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

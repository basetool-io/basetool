import { ColumnWithBaseOptions } from "../abstract-sql-query-service/types";
import { FieldType } from "@/features/fields/types";
import { MysqlCredentials } from "./types";
import { idColumns } from "@/features/fields";
import AbstractQueryService from "../abstract-sql-query-service/AbstractQueryService";

class QueryService extends AbstractQueryService {
  public getCredentials() {
    const credentials = this.getParsedCredentials() as MysqlCredentials;

    if (!credentials || !credentials.host)
      throw new Error("No credentials on record.");

    return credentials;
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

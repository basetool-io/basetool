import { DataSourceInfo } from "../types";
import { defaultSettings } from "../abstract-sql-query-service"

const info: DataSourceInfo = {
  ...defaultSettings,
  id: "mssql",
  name: "SQL Server",
  description: "Microsoft SQL server data source",
};

export default info;

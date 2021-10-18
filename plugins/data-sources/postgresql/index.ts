import { DataSourceInfo } from "../types";
import { defaultSettings } from "../abstract-sql-query-service"

const info: DataSourceInfo = {
  ...defaultSettings,
  id: "postgresql",
  name: "PostgreSQL",
  description: "PostgreSQL data source",
};

export default info;

import { DataSourceInfo } from "../types";
import { defaultSettings } from "../abstract-sql-query-service"

const info: DataSourceInfo = {
  ...defaultSettings,
  id: "mysql",
  name: "MySQL",
  description: "MySQL data source",
};

export default info;

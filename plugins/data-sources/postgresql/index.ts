import { DataSourceInfo } from "../types";
import { defaultSettings } from "../abstract-sql-query-service";
import { merge } from "lodash";

const info: DataSourceInfo = merge(defaultSettings, {
  id: "postgresql",
  name: "PostgreSQL",
  description: "PostgreSQL data source",
  supports: {
    columnsRequest: false,
  },
});

export default info;

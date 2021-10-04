import { DataSourceInfo } from "../types"

const info: DataSourceInfo = {
  id: "postgresql",
  name: "PostgreSQL",
  description: "PostgreSQL data source",
  readOnly: false,
  requests: {
    columns: true
  }
};

export default info;

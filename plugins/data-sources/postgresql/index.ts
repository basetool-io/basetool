import { DataSourceInfo } from "../types"

const info: DataSourceInfo = {
  id: "postgresql",
  name: "PostgreSQL",
  description: "PostgreSQL data source",
  readOnly: false,
  supports: {
    filters: true,
    columnsRequest: true,
  },
};

export default info;

import { DataSourceInfo } from "../types"

const info: DataSourceInfo = {
  id: "mssql",
  name: "SQL Server",
  description: "Microsoft SQL server data source",
  readOnly: false,
  requests: {
    columns: true
  }
};

export default info;

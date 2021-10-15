import { DataSourceInfo } from "../types"

const info: DataSourceInfo = {
  id: "mssql",
  name: "SQL Server",
  description: "Microsoft SQL server data source",
  readOnly: false,
  supports: {
    filters: true,
    columnsRequest: true,
  },
};

export default info;

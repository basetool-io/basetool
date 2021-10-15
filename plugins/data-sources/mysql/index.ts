import { DataSourceInfo } from "../types"

const info: DataSourceInfo = {
  id: "mysql",
  name: "MySQL",
  description: "MySQL data source",
  readOnly: false,
  supports: {
    filters: true,
    columnsRequest: true,
  },
};

export default info;

import { DataSourceInfo } from "../types";
import mysqlInfo from "./../mysql";

const info: DataSourceInfo = {
  ...mysqlInfo,
  id: "maria_db",
  name: "Maria DB",
  description: "Maria DB data source",
};

export default info;

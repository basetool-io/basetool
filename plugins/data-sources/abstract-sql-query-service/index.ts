import { DataSourceInfo } from "../types";

export const defaultSettings: Partial<DataSourceInfo> = {
  readOnly: false,
  pagination: "offset",
  supports: {
    filters: true,
    columnsRequest: true,
    views: true,
  },
  runsInProxy: true,
};

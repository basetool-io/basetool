import { DataSourceInfo } from "../types";

export const defaultSettings: Omit<
  DataSourceInfo,
  "id" | "name" | "description"
> = {
  readOnly: false,
  pagination: "offset",
  supports: {
    filters: true,
    columnsRequest: true,
    views: true,
  },
  runsInProxy: true,
};

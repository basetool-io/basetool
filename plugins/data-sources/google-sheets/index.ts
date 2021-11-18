import { DataSourceInfo } from "../types";
import { defaultSettings } from "../abstract-sql-query-service";

interface GoogleSheetsDataSourceInfo extends DataSourceInfo {
  oauthScopes: string[];
}

const info: GoogleSheetsDataSourceInfo = {
  ...defaultSettings,
  id: "googleSheets",
  name: "Google sheets",
  description: "Google sheets",
  oauthScopes: [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.file",
    // 'https://www.googleapis.com/auth/drive.readonly',
  ],
  runsInProxy: false,
};

export default info;

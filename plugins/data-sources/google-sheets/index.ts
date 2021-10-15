import { DataSourceInfo } from "../types";

interface GoogleSheetsDataSourceInfo extends DataSourceInfo {
  oauthScopes: string[];
}

const info: GoogleSheetsDataSourceInfo = {
  id: "googleSheets",
  name: "Google sheets",
  description: "Google sheets",
  oauthScopes: [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.file",
    // 'https://www.googleapis.com/auth/drive.readonly',
  ],
  readOnly: false,
  supports: {
    filters: true,
    columnsRequest: true,
  },
};

export default info;

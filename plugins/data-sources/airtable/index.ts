import { DataSourceInfo } from "../types";

const info: DataSourceInfo = {
  id: "airtable",
  name: "Airtable",
  description: "Airtable",
  readOnly: true,
  pagination: 'cursor',
  supports: {
    filters: false,
    columnsRequest: false,
    views: false,
  },
  runsInProxy: false,
};

export default info;

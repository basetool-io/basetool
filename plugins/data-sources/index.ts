import { DataSourcePlugin } from './types'
import postgresql from "./postgresql";

const dataSources: DataSourcePlugin[] = [postgresql];

export default dataSources

const availableDataSources = [
  {
    id: "postgresql",
    label: "PostgreSQL",
    enabled: true,
  },
  {
    id: "google-sheets",
    label: "Google Sheets",
    enabled: true,
  },
  // {
  //   id: "mssql",
  //   label: "MSSQL (coming soon)",
  //   enabled: false,
  // },
  // {
  //   id: "my_sql",
  //   label: "MySQL (coming soon)",
  //   enabled: false,
  // },
  // {
  //   id: "maria_db",
  //   label: "MariaDB (coming soon)",
  //   enabled: false,
  // },
  // {
  //   id: "sq_lite3",
  //   label: "SQLite3 (coming soon)",
  //   enabled: false,
  // },
  // {
  //   id: "oracle",
  //   label: "Oracle (coming soon)",
  //   enabled: false,
  // },
  // {
  //   id: "amazon_redshift",
  //   label: "Amazon Redshift (coming soon)",
  //   enabled: false,
  // },
  // {
  //   id: "airtable",
  //   label: "Airtable (coming soon)",
  //   enabled: false,
  // },
  // {
  //   id: "google_sheets",
  //   label: "Google Sheets (coming soon)",
  //   enabled: false,
  // },
];

export {availableDataSources}

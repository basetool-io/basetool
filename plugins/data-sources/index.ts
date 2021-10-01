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
    id: "mysql",
    label: "MySQL",
    enabled: true,
  },
  {
    id: "google-sheets",
    label: "Google Sheets (beta)",
    enabled: true,
  },
  {
    id: "mssql",
    label: "MSSQL",
    enabled: true,
  },
  {
    id: "maria_db",
    label: "MariaDB",
    enabled: true,
  },
  {
    id: "sq_lite3",
    label: "SQLite3 (coming soon)",
    enabled: false,
  },
  {
    id: "oracle",
    label: "Oracle (coming soon)",
    enabled: false,
  },
  {
    id: "amazon_redshift",
    label: "Amazon Redshift (coming soon)",
    enabled: false,
  },
  {
    id: "airtable",
    label: "Airtable (coming soon)",
    enabled: false,
  },
];

export {availableDataSources}

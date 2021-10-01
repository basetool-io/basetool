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
    id: "google-sheets",
    label: "Google Sheets",
    enabled: true,
    beta: true,
  },
  {
    id: "stripe",
    label: "Stripe",
    enabled: true,
    comingSoon: true,
  },
  {
    id: "amazon_redshift",
    label: "Amazon Redshift",
    enabled: false,
    comingSoon: true,
  },
  {
    id: "airtable",
    label: "Airtable",
    enabled: false,
    comingSoon: true,
  },
  {
    id: "github",
    label: "GitHub",
    enabled: false,
    comingSoon: true,
  },
];

export {availableDataSources}

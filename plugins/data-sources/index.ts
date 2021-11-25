import { DataSourcePlugin } from "./types";
import { humanize } from "@/lib/humanize";
import postgresql from "./postgresql";

const dataSources: DataSourcePlugin[] = [postgresql];

export default dataSources;

export const availableDataSources = [
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
    id: "mssql",
    label: "MSSQL",
    enabled: false,
    beta: true,
  },
  {
    id: "stripe",
    label: "Stripe",
    enabled: true,
    comingSoon: true,
    beta: false,
    readOnly: true,
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
    id: "swagger",
    label: "Swagger",
    enabled: false,
    comingSoon: true,
  },
  {
    id: "github",
    label: "GitHub",
    enabled: false,
    comingSoon: true,
  },
  {
    id: "zendesk",
    label: "ZenDesk",
    enabled: false,
    comingSoon: true,
  },
  {
    id: "salesforce",
    label: "Salesforce",
    enabled: false,
    comingSoon: true,
  },
  {
    id: "shopify",
    label: "Shopify",
    enabled: false,
    comingSoon: true,
  },
  {
    id: "intercom",
    label: "Intercom",
    enabled: false,
    comingSoon: true,
  },
  {
    id: "redis",
    label: "Redis",
    enabled: false,
    comingSoon: true,
  },
];

export const getColumnLabel = (column: { name: string }) => {
  if (column.name === "id") return "ID";

  return humanize(column.name);
};

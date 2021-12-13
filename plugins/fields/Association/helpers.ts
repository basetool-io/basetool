import { TableMetaData } from "@/plugins/data-sources/abstract-sql-query-service/doInitialScan";

type PossibleTypes = string | number | boolean | null | undefined;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getForeignName = (
  record: Record<string, PossibleTypes>,
  options?: { field?: string; tableMetadata?: TableMetaData }
): string | null => {
  // See if we have some `name` column set in the DB
  let prettyName: PossibleTypes = "";

  if (record) {
    // Use the `nameColumn` attribute
    if (options?.field) {
      prettyName = record[options?.field];
    } else {
      // Try and find a common `name` columns
      if (record.url) prettyName = record.url;
      if (record.email) prettyName = record.email;
      if (record.first_name) prettyName = record.first_name;
      if (record.firstName) prettyName = record.firstName;
      if (record.title) prettyName = record.title;
      if (record.name) prettyName = record.name;
    }

    if (prettyName) return prettyName.toString();

    if (record && record?.id) return `${record.id}`;
  }

  return null;
};

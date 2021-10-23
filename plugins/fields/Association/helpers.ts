import { Field } from "@/features/fields/types";

export const getForeignName = (record: any, field: Field) => {
  // See if we have some `name` column set in the DB
  const nameColumn: any = field?.column?.fieldOptions?.nameColumn;

  let prettyName = "";

  if (record) {
    // Use the `nameColumn` attribute
    if (nameColumn) {
      prettyName = record[nameColumn];
    } else {
      // Try and find a common `name` columns
      if (record.url) prettyName = record.url;
      if (record.email) prettyName = record.email;
      if (record.first_name) prettyName = record.first_name;
      if (record.firstName) prettyName = record.firstName;
      if (record.title) prettyName = record.title;
      if (record.name) prettyName = record.name;
    }
  }

  if (prettyName) return `${prettyName} [${record.id}]`;

  if (record && record.id) return `${record.id}`;

  return null;
};

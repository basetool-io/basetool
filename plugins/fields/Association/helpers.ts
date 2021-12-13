import { BasetoolRecord, PossibleRecordValues } from "@/features/records/types";

// @todo: refactor this
export const getForeignName = (
  record: BasetoolRecord,
  field?: string | undefined
): string => {
  // See if we have some `name` column set in the DB
  let prettyName: PossibleRecordValues = "";

  // Use the `nameColumn` attribute
  if (field) {
    prettyName = record[field];
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

  if (record && record?.id) return record.id.toString();

  return "";
};

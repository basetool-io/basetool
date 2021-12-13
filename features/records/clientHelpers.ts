import { BasetoolRecord, PossibleRecordValues } from "@/features/records/types";
import { Column } from "../fields/types"
import { IFilter } from "../tables/types";
import { isArray, isString } from "lodash";

export const filtersForHasMany = (
  columnName: string,
  ids: string | number[]
): IFilter[] => {
  let value = "";

  if (isArray(ids)) {
    value = ids.join(",");
  } else if (isString(ids)) {
    value = ids;
  }

  return [
    {
      column: {} as Column,
      columnName,
      condition: "is_in",
      value,
      verb: "and",
    },
  ];
};

/**
 * This method tries to extract a pretty name from a record
 */
export const getPrettyName = (
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

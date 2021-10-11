import { Field } from "@/features/fields/types";

const useForeignName = (field: Field) => {
  const getForeignName = (record: any) => {
    // See if we have some `name` column set in the DB
    const nameColumn: any = field?.column?.fieldOptions?.nameColumn;

    let prettyName = "";

    if (record) {
      // Try and find a common `name` column
      if (record.first_name) prettyName = record.first_name;
      if (record.firstName) prettyName = record.firstName;
      if (record.title) prettyName = record.title;
      if (record.name) prettyName = record.name;

      // Use the `nameColumn` attribute
      if (nameColumn) prettyName = record[nameColumn];
    }

    if (prettyName) return `${prettyName} [${record.id}]`;

    if (record && record.id) return `${record.id}`;

    return null;
  };

  return getForeignName;
};

export { useForeignName };

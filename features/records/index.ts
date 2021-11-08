import { Column } from "@/features/fields/types";
import { Views } from "@/features/fields/enums";
import { getFilteredColumns } from "@/features/fields";
import { isEmpty } from "lodash";
import Handlebars from "handlebars";

/**
 * This method will hydrate the record with the computed fields and remove the columns that were filtered out
 */
export const hydrateRecord = (record: any, columns: Column[]) => {
  // Get the computed columns.
  const computedColumns = columns.filter(
    (column: Column) => column?.baseOptions?.computed === true
  );

  // Compute and set the value to the record.
  computedColumns.forEach((computedColumn) => {
    const editorData = computedColumn?.baseOptions?.computedSource;
    addComputedField(record, editorData, computedColumn.name);
  });

  // Get the filtered column names.
  const filteredColumnNames = getFilteredColumns(columns, Views.show).map(
    ({ name }) => name
  );

  // Filter out the columns that were hidden
  // Go into each record and remove the filtered out columns.
  record = Object.fromEntries(
    Object.entries(record).filter(([key]) => filteredColumnNames.includes(key))
  );

  return record;
};

const addComputedField = async (
  record: any,
  editorData: string,
  computedName: string
) => {
  const queryableData = { record };
  if (editorData) {
    try {
      const template = Handlebars.compile(editorData);
      const value = template(queryableData);

      record[computedName] = value;
    } catch (error) {
      console.error("Couldn't parse value.", error);
    }
  }
};

export const hydrateColumns = (
  columns: Column[],
  storedColumns: Column[]
): Column[] => {
  // Computed columns are bypassed in the database "getColumns", so we need to add them here.
  if (!isEmpty(storedColumns)) {
    const computedColumns = Object.values(storedColumns).filter(
      (column: any) => column?.baseOptions?.computed === true
    );
    if (!isEmpty(computedColumns)) {
      columns = [...columns, ...(computedColumns as Column[])];
    }
  }

  return columns;
};

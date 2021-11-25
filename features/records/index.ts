import { Column } from "@/features/fields/types";
import { DataSource } from "@prisma/client";
import { getConnectedColumns } from "@/features/fields";
import { getForeignName } from "@/plugins/fields/Association/helpers";
import { isArray, isEmpty, merge, uniq } from "lodash";
import { runQuery } from "@/plugins/data-sources/serverHelpers";
import Handlebars from "handlebars";

/**
 * This method will filter out record fields that are disconnected.
 */
export const filterOutRecordColumns = (
  records: any,
  columns: Column[],
) => {
  return records.map((record: Record<string, unknown>) => {
    // Get the filtered column names.
    const filteredColumnNames = getConnectedColumns(columns).map(
      ({ name }) => name
    );

    // Filter out the columns that were hidden
    // Go into each record and remove the filtered out columns.
    record = Object.fromEntries(
      Object.entries(record).filter(([key]) =>
        filteredColumnNames.includes(key)
      )
    );

    return record;
  });
};

/**
 * This method will hydrate the records with the computed fields and associations.
 */
export const hydrateRecords = async (
  records: any,
  columns: Column[],
  dataSource: DataSource
) => {
  const hydratedRecords = records.map((record: any) => {
    // Get the computed columns.
    const computedColumns = columns.filter(
      (column: Column) => column?.baseOptions?.computed === true
    );

    // Compute and set the value to the record.
    computedColumns.forEach((computedColumn) => {
      const editorData = computedColumn?.baseOptions?.computedSource;
      addComputedField(record, editorData, computedColumn.name);
    });

    return record;
  });

  // Find out the association columns.
  const associationColumns = columns.filter(
    (column: Column) => column.fieldType === "Association"
  );

  // If there are association columns, hydrate the records with the associations.
  if (!isEmpty(associationColumns)) {
    const hydratedRecordsWithAssociations = hydrateAssociations(
      hydratedRecords,
      associationColumns,
      dataSource
    );

    return hydratedRecordsWithAssociations;
  } else {
    return hydratedRecords;
  }
};

/**
 * This method will retrieve data from the association and replace the id value with the display value, foreignId, foreignTable and dataSource.
 */
const hydrateAssociations = async (
  records: any[],
  associationColumns: Column[],
  dataSource: DataSource
) => {
  let hydratedRecordsAssociation = records;
  for (const column of associationColumns) {
    const foreignIds = records.map((record: any) => record[column.name]);
    const foreignTableName = column.foreignKeyInfo.foreignTableName as string;

    const filters: Record<string, any> = [
      {
        columnName: "id",
        condition: "is_in",
        value: uniq(foreignIds).toString(),
        verb: "and",
      },
    ];

    const foreignRecords: any[] = await runQuery(dataSource, "getRecords", {
      tableName: foreignTableName,
      filters,
    });

    hydratedRecordsAssociation = hydratedRecordsAssociation.map(
      (record: any) => {
        const foreignRecordComputed = foreignRecords.find(
          (foreignRecord: any) => foreignRecord.id === record[column.name]
        );

        const foreignNameColumn = getForeignName(foreignRecordComputed, column);

        record[column.name] = {
          value: foreignNameColumn,
          foreignId: parseInt(foreignRecordComputed.id),
          foreignTable: foreignTableName,
          dataSourceId: dataSource.id,
        };

        return record;
      }
    );
  }

  return hydratedRecordsAssociation;
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
  if (!isEmpty(storedColumns) && isArray(storedColumns)) {
    const computedColumns = storedColumns.filter(
      (column: any) => column?.baseOptions?.computed === true
    );

    // Add computed columns
    if (!isEmpty(computedColumns)) {
      columns = [...columns, ...(computedColumns as Column[])];
    }

    // Update columns with stored options
    storedColumns
      .filter((column: any) => column?.baseOptions?.computed !== true)
      .forEach((storedColumn) => {
        const columnIndex = columns.findIndex(
          (c) => c.name === storedColumn.name
        );

        if (columnIndex > -1) {
          columns[columnIndex] = merge(columns[columnIndex], storedColumn);
        }
      });
  }

  return columns;
};

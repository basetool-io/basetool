import { BasetoolRecord, PossibleRecordValues } from "./types";
import { Column } from "@/features/fields/types";
import { DataSource } from "@prisma/client";
import {
  LinkToValueFieldOptions,
  LinkToValueItem,
} from "@/plugins/fields/LinkTo/types";
import { TableMetaData } from "../data-sources/types";
import { filtersForHasMany, getPrettyName } from "./clientHelpers";
import { getConnectedColumns } from "@/features/fields";
import { isArray, isEmpty, isString, merge, uniq } from "lodash";
import { runQuery } from "@/plugins/data-sources/serverHelpers";
import Handlebars from "handlebars";

/**
 * This method will filter out record fields that are disconnected.
 */
export const filterOutRecordColumns = (records: any, columns: Column[]) => {
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
  let hydratedRecords = records.map((record: any) => {
    // Get the computed columns.
    const computedColumns = columns.filter(
      (column: Column) =>
        column?.baseOptions?.computed === true && column.fieldType !== "LinkTo"
    );

    // Compute and set the value to the record.
    computedColumns.forEach((computedColumn) => {
      const editorData = computedColumn?.baseOptions?.computedSource;
      addComputedField(record, editorData, computedColumn.name);
    });

    return record;
  });

  // Get the LinkTo columns.
  const linkToColumns = columns.filter(
    (column: Column) => column.fieldType === "LinkTo"
  ) as Column<Record<string, unknown>, LinkToValueFieldOptions>[];

  // Extrct all LinkTo columns
  const linkToAssociationsByColumnName: {
    [columnName: string]: BasetoolRecord[];
  } = {};

  for (const column of linkToColumns) {
    const { tableName, columnName } = column.fieldOptions;

    // Fetch the records
    const linkedRecords = await getLinkedRecords(
      hydratedRecords,
      tableName,
      columnName,
      dataSource
    );

    linkToAssociationsByColumnName[columnName] ||= [];
    // Add them to a variable
    linkedRecords.map((record) =>
      linkToAssociationsByColumnName[columnName].push(record)
    );
  }

  // Add them to the records
  hydratedRecords = hydratedRecords.map(
    (record: BasetoolRecord<PossibleRecordValues | LinkToValueItem[]>) => {
      try {
        linkToColumns.forEach((column) => {
          const { tableName } = column.fieldOptions;
          let nameColumn = column?.fieldOptions?.columnName || "id";

          // Try and find the name column for that table
          if (dataSource?.tablesMetaData) {
            const tableMetaData = (
              dataSource?.tablesMetaData as TableMetaData[]
            )?.find(
              (metaData: { name: string }) => metaData.name === tableName
            );
            if (tableMetaData && isString(tableMetaData.nameColumn))
              nameColumn = tableMetaData.nameColumn;
          }

          const associations = linkToAssociationsByColumnName[
            column.fieldOptions.columnName
          ]?.filter((rec) => rec[column.fieldOptions.columnName] === record.id);

          record[column.name] = associations.map((association) => {
            const label = getPrettyName(association, nameColumn);

            return {
              id: parseInt(association.id as string),
              label,
              foreignId: parseInt(record.id as string),
              foreignTable: tableName,
              dataSourceId: dataSource.id,
              foreignColumnName: column.fieldOptions.columnName,
            };
          });
        });
      } catch (error) {}

      return record;
    }
  );

  // Find out the association columns.
  const associationColumns = columns.filter(
    (column: Column) => column.fieldType === "Association"
  );

  // If there are association columns, hydrate the records with the associations.
  if (!isEmpty(associationColumns)) {
    try {
      return await hydrateAssociations(
        hydratedRecords,
        associationColumns,
        dataSource
      );
    } catch (error) {
      return hydratedRecords;
    }
  } else {
    return hydratedRecords;
  }
};

const getLinkedRecords = async (
  records: BasetoolRecord[],
  tableName: string,
  columnName: string,
  dataSource: DataSource
): Promise<BasetoolRecord[]> => {
  // @todo: support custom localKey not just id
  const foreignIds = records.map((record: any) => record.id);

  const filters = filtersForHasMany(
    columnName,
    uniq(foreignIds).filter(Boolean).toString()
  );

  const { records: foreignRecords } = await runQuery(dataSource, "getRecords", {
    tableName,
    filters,
  });

  return foreignRecords;
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
        value: uniq(foreignIds).filter(Boolean).toString(),
        verb: "and",
      },
    ];

    const { records: foreignRecords } = await runQuery(
      dataSource,
      "getRecords",
      {
        tableName: foreignTableName,
        filters,
      }
    );

    hydratedRecordsAssociation = hydratedRecordsAssociation.map(
      (record: any) => {
        const foreignRecordComputed = foreignRecords.find(
          (foreignRecord: any) => foreignRecord?.id === record[column.name]
        );

        if (!foreignRecordComputed) return record;

        const foreignNameColumn = getPrettyName(
          foreignRecordComputed,
          column?.fieldOptions?.nameColumn as string
        );

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

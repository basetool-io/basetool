import { Column } from "../fields/types";
import { LOCAL_STORAGE_PREFIX } from "@/lib/constants";
import { Column as ReactTableColumn } from "react-table";
import { useMemo } from "react";

export const DEFAULT_COLUMN_WIDTH = 150;
export const MIN_COLUMN_WIDTH = 30;
export const MAX_COLUMN_WIDTH = 800;

export const localStorageColumnWidthKey = ({
  dataSourceId,
  tableName,
  columnName,
}: {
  dataSourceId: string;
  tableName: string;
  columnName: string;
}) =>
  `${LOCAL_STORAGE_PREFIX}:data-source-${dataSourceId}table-${tableName}-column-${columnName}`;

export const parseColumns = ({
  columns,
  dataSourceId,
  tableName,
}: {
  columns: Column[];
  dataSourceId: string;
  tableName: string;
}): ReactTableColumn[] => {
  return columns.map((column) => {
    const columnName = column.name;
    const localStorageKey = localStorageColumnWidthKey({
      dataSourceId,
      tableName,
      columnName,
    });
    let columnWidth;

    try {
      columnWidth =
        parseInt(window.localStorage.getItem(localStorageKey) as string) ||
        DEFAULT_COLUMN_WIDTH;
    } catch (error) {
      columnWidth = DEFAULT_COLUMN_WIDTH;
    }

    const prettyColumnName = useMemo(
      () => (column?.baseOptions?.label ? column?.baseOptions?.label : (column?.label ? column?.label : column?.name)),
      [column?.baseOptions?.label, column?.label]
    );

    return {
      Header: prettyColumnName,
      accessor: column.name,
      meta: {
        ...column,
      },
      width: columnWidth,
      minWidth: MIN_COLUMN_WIDTH,
      maxWidth: MAX_COLUMN_WIDTH,
    };
  });
};

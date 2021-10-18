import { Column } from "../fields/types";
import {
  DEFAULT_COLUMN_WIDTH,
  LOCAL_STORAGE_PREFIX,
  MAX_COLUMN_WIDTH,
  MIN_COLUMN_WIDTH,
} from "@/lib/constants";
import { Column as ReactTableColumn } from "react-table";
import { getColumnNameLabel } from "../fields";

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

    const prettyColumnName = getColumnNameLabel(
      column?.baseOptions?.label,
      column?.label,
      column?.name
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

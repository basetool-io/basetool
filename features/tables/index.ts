import { Column } from "../fields/types";
import {
  DEFAULT_COLUMN_WIDTH,
  LOCAL_STORAGE_PREFIX,
  MAX_COLUMN_WIDTH,
  MIN_COLUMN_WIDTH,
} from "@/lib/constants";
import { Column as ReactTableColumn } from "react-table";
import { getColumnNameLabel } from "../fields";

export const localStorageColumnWidthsKey = ({
  dataSourceId,
  tableName,
}: {
  dataSourceId: string;
  tableName: string;
}) => `${LOCAL_STORAGE_PREFIX}-data-source:${dataSourceId}-table:${tableName}`;

export const parseColumns = ({
  columns,
  columnWidths,
}: {
  columns: Column[];
  columnWidths: Record<Column["name"], number>;
}): ReactTableColumn[] => {
  return columns.map((column) => {
    const width = columnWidths[column.name] || DEFAULT_COLUMN_WIDTH;

    return {
      Header: getColumnNameLabel(
        column?.baseOptions?.label,
        column?.label,
        column?.name
      ),
      accessor: column.name,
      meta: {
        ...column,
      },
      width,
      minWidth: MIN_COLUMN_WIDTH,
      maxWidth: MAX_COLUMN_WIDTH,
    };
  });
};

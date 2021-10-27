import { Column, FieldType } from "../fields/types";
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
    let width = DEFAULT_COLUMN_WIDTH;

    // Try to fetch the column width
    try {
      width = columnWidths[column.name] || DEFAULT_COLUMN_WIDTH;
    } catch (error) {}

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

export const getDefaultFilterCondition = (fieldType: FieldType) => {
  switch (fieldType) {
    case "Id":
    case "Number":
    case "Association":
      return IntFilterConditions.is;
    case "Boolean":
      return BooleanFilterConditions.is_true;
    case "DateTime":
      return DateFilterConditions.is;
    case "Select":
      return SelectFilterConditions.is;
    default:
    case "Text":
      return StringFilterConditions.is;
  }
};


export enum BooleanFilterConditions {
  is_true = "is_true",
  is_false = "is_false",
  is_null = "is_null",
  is_not_null = "is_not_null",
}

export enum IntFilterConditions {
  is = "is",
  is_not = "is_not",
  gt = "gt",
  gte = "gte",
  lt = "lt",
  lte = "lte",
  is_null = "is_null",
  is_not_null = "is_not_null",
}

export enum SelectFilterConditions {
  is = "is",
  is_not = "is_not",
  contains = "contains",
  not_contains = "not_contains",
  is_empty = "is_empty",
  is_not_empty = "is_not_empty",
  is_null = "is_null",
  is_not_null = "is_not_null",
}

export enum DateFilterConditions {
  is = "is",
  is_not = "is_not",
  is_before = "is_before",
  is_after = "is_after",
  is_on_or_before = "is_on_or_before",
  is_on_or_after = "is_on_or_after",
  is_within = "is_within",
  is_empty = "is_empty",
  is_not_empty = "is_not_empty",
  is_null = "is_null",
  is_not_null = "is_not_null",
}
export enum StringFilterConditions {
  is = "is",
  is_not = "is_not",
  contains = "contains",
  not_contains = "not_contains",
  starts_with = "starts_with",
  ends_with = "ends_with",
  is_empty = "is_empty",
  is_not_empty = "is_not_empty",
  is_null = "is_null",
  is_not_null = "is_not_null",
}

export enum FilterVerbs {
  and = "and",
  or = "or",
}

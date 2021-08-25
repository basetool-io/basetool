import type { Column } from "@/features/fields/types";

export type Table = {
  columns?: {
    [columnName: string]: Column;
  };
};

export type Tables = {
  [tableName: string]: Table;
};

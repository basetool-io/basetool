import type { Column } from "@/features/fields/types";

export type Table = {
  columns?: {
    [columnName: string]: Column;
  };
};

export type Tables = {
  [tableName: string]: Table;
};

export type OrderDirection = '' | 'asc' | 'desc'

export type FilterConditions =
  | IntFilterConditions
  | StringFilterConditions
  | BooleanFilterConditions
  | DateFilterConditions
  | SelectFilterConditions;

export type IFilter = {
  column: Column;
  columnName: string;
  verb: FilterVerb;
  condition: FilterConditions;
  option?: string;
  value?: string;
  isBase?: boolean;
};

export type IFilterGroup = {
  isGroup: boolean;
  verb: FilterVerb;
  filters: IFilter[];
  isBase?: boolean;
};

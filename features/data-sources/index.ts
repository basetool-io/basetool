import { ListTable } from "@/plugins/data-sources/abstract-sql-query-service/types";

export const getLabel = (table: ListTable): string => {
  if (table.label) return table.label;

  return table.name;
};

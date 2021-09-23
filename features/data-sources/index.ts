import { ListTable } from "@/plugins/data-sources/postgresql/types";

export const getLabel = (table: ListTable): string => {
  if (table.label) return table.label;

  return table.name;
};

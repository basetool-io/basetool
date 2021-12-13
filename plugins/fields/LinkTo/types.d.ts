export type LinkToValueFieldOptions = {
  tableName: string;
  columnName: string;
};

export type LinkToValueItem = {
  id: number;
  label: string;
  foreignId: number;
  foreignTable: string;
  dataSourceId: number;
  foreignColumnName: string;
};

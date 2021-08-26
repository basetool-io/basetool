import { Views } from "./enums";
import type { Record as BasetoolRecord } from "@/features/records";

export type FieldType =
  | "Id"
  | "Text"
  | "Textarea"
  | "Number"
  | "Select"
  | "Boolean"
  | "DateTime";

export type ForeignKey = {
  /* eslint-disable camelcase */
  table_schema: string;
  constraint_name: string;
  table_name: string;
  column_name: string;
  foreign_table_schema: string;
  foreign_table_name: string;
  foreign_column_name: string;
  /* eslint-enable camelcase */
};

export type BaseOptions = {
  visibility: Views[];
  nullable: boolean;
  required: boolean;
};

export type Column<
  DataSourceColumnInfo = Record<string, unknown>,
  FieldColumnOptions = Record<string, unknown>
> = {
  name: string; // machine name
  label: string; // Human readable name
  fieldType: FieldType;
  primaryKey?: boolean;

  baseOptions: BaseOptions;
  dataSourceInfo: DataSourceColumnInfo;
  fieldOptions: FieldColumnOptions;
};

export type FieldValue = string | number | undefined | boolean;

export type Field = {
  value: FieldValue;
  column: Column;
  record: BasetoolRecord;
  tableName: string;
};

export type EditFieldProps = {
  field: Field;
  formState: any;
  register: any;
  schema?: AnySchema;
  setValue?: (name: string, value: unknown, config?: unknown) => void;
};

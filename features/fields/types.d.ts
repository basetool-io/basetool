import { Views } from "./enums";

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

export type NullableEntry = {
  table_schema: string;
  table_name: string;
  column_name: string;
  nullable: "is nullable" | "not nullable";
};

export type DefaultEntry = {
  column_name: string;
  column_default: string | null;
};

export type Column = {
  name: string; // machine name
  label: string; // Human readable name
  fieldType: FieldType;
  dataType: string;
  visibility: Views[];
  primaryKey?: boolean;
  foreignKey?: ForeignKey;
  nullable: boolean;
  required: boolean;
};

export type RawColumn = {
  // eslint-disable-next-line camelcase
  column_name: string;
  // eslint-disable-next-line camelcase
  data_type: string;
  // eslint-disable-next-line camelcase
  table_name: string;
};

export type IntermediateColumn = {
  name: string;
  fieldType: FieldType;
  dataType: string;
};

export type FieldValue = string | number | undefined | boolean;

export type Record = {
  [key: string]: FieldValue;
};

export type Field = {
  value: FieldValue;
  column: Column;
  record: Record;
  tableName: string;
};

export type EditFieldProps = {
  field: Field;
  formState: any;
  register: any;
  schema?: AnySchema;
  setValue?: (name: string, value: unknown, config?: Object) => void;
};

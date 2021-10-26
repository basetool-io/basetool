import { FieldType } from "../fields/types"
import { ListTable } from "@/plugins/data-sources/abstract-sql-query-service/types";
import { S3_SSH_KEYS_BUCKET_PREFIX } from "@/lib/constants";
import { Views } from "../fields/enums"
import { inProduction } from "@/lib/environment";

export const getLabel = (table: ListTable): string => {
  if (table.label) return table.label;

  return table.name;
};

export const s3KeysBucket = () => {
  return `${S3_SSH_KEYS_BUCKET_PREFIX}${
    inProduction ? "production" : "staging"
  }`;
};

export const INITIAL_NEW_COLUMN = {
  name: "computed_field",
  label: "Computed field",
  primaryKey: false,
  baseOptions: {
    visibility: [Views.index, Views.show],
    required: false,
    nullable: false,
    nullValues: [],
    readonly: false,
    placeholder: "",
    help: "",
    label: "",
    disconnected: false,
    defaultValue: "",
    computed: true,
  },
  fieldType: "Text" as FieldType,
  fieldOptions: {
    value: "",
  },
};

import { FieldType } from "../fields/types"
import { S3_SSH_KEYS_BUCKET_PREFIX } from "@/lib/constants";
import { inProduction } from "@/lib/environment";

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
    visibleOnIndex: true,
    visibleOnShow: true,
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

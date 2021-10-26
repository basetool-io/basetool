import { ListTable } from "@/plugins/data-sources/abstract-sql-query-service/types";
import { S3_SSH_KEYS_BUCKET_PREFIX } from "@/lib/constants";
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

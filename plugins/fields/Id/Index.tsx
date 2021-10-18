import { Code } from "@chakra-ui/layout";
import { Field } from "@/features/fields/types";
import { isNull, isUndefined } from "lodash";
import { useRouter } from "next/router";
import IndexFieldWrapper from "@/features/fields/components/FieldWrapper/IndexFieldWrapper";
import Link from "next/link";
import React, { memo } from "react";

const Index = ({ field }: { field: Field }) => {
  const router = useRouter();
  let href = '';
  if (!isUndefined(router.query.tableName)) {
    href = `/data-sources/${router.query.dataSourceId}/tables/${router.query.tableName}/${field.record.id}`;
  } else if (!isUndefined(router.query.viewId)) {
    href = `/data-sources/${router.query.dataSourceId}/views/${router.query.viewId}/records/${field.record.id}`;
  }
  const value = isNull(field.value) ? <Code>null</Code> : field.value;

  return (
    <IndexFieldWrapper field={field}>
      <Link href={href}>
        <a className="text-blue-600">{value}</a>
      </Link>
    </IndexFieldWrapper>
  );
};

export default memo(Index);

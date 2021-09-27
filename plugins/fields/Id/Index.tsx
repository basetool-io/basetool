import { Field } from "@/features/fields/types";
import { useRouter } from "next/router";
import IndexFieldWrapper from "@/features/fields/components/FieldWrapper/IndexFieldWrapper";
import Link from "next/link";
import React, { memo } from "react";

const Index = ({ field }: { field: Field }) => {
  const router = useRouter();
  const href = `/data-sources/${router.query.dataSourceId}/tables/${router.query.tableName}/${field.record.id}`;

  return (
    <IndexFieldWrapper field={field}>
      <Link href={href}>
        <a className="text-blue-600">{field.value}</a>
      </Link>
    </IndexFieldWrapper>
  );
};

export default memo(Index);

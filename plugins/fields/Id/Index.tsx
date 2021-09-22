import { Field } from "@/features/fields/types";
import { useRouter } from "next/router";
import IndexFieldWrapper from "@/features/fields/components/FieldWrapper/IndexFieldWrapper";
import Link from "next/link";
import React, { memo } from "react";

const Index = ({ field }: { field: Field }) => {
  const router = useRouter();
  const dataSourceId = router.query.dataSourceId as string;
  const tableName = router.query.tableName as string;

  const link = `/data-sources/${dataSourceId}/tables/${tableName}/${field.value}`;

  return (
    <IndexFieldWrapper field={field}><Link href={link}>{field.value}</Link></IndexFieldWrapper>
  )
};

export default memo(Index);

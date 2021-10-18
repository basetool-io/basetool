import { ArrowRightIcon } from "@heroicons/react/outline";
import { Field } from "@/features/fields/types";
import { Tooltip } from "@chakra-ui/react";
import { getForeignName } from "./helpers";
import { useGetRecordQuery } from "@/features/records/api-slice";
import { useRouter } from "next/router";
import IndexFieldWrapper from "@/features/fields/components/FieldWrapper/IndexFieldWrapper";
import Link from "next/link";
import React, { memo } from "react";
import Shimmer from "@/components/Shimmer";

const Index = ({ field }: { field: Field }) => {
  const router = useRouter();
  const dataSourceId = router.query.dataSourceId as string;
  const tableName = field.column.foreignKeyInfo.foreignTableName as string;
  const recordId = field.value || null;
  const { data: recordResponse, isLoading } = useGetRecordQuery(
    {
      dataSourceId,
      tableName,
      recordId: recordId as string,
    },
    { skip: !dataSourceId || !tableName || !recordId }
  );

  return (
    <IndexFieldWrapper field={field}>
      {isLoading && <Shimmer height={16.5} />}
      {isLoading || (
        <>
          {getForeignName(recordResponse?.data, field) || field.value}
          <Link
            href={`/data-sources/${router.query.dataSourceId}/tables/${field.column.foreignKeyInfo.foreignTableName}/${field.value}?fromTable=${router.query.tableName}`}
          >
            <a
              title="Go to record"
              className="ml-1 text-blue-600 cursor-pointer"
            >
              <Tooltip label="Go to record">
                <span className="inline-flex">
                  <ArrowRightIcon className="inline-block h-3" />
                </span>
              </Tooltip>
            </a>
          </Link>
        </>
      )}
    </IndexFieldWrapper>
  );
};

export default memo(Index);

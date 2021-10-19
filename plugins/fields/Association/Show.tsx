import { ArrowRightIcon } from "@heroicons/react/outline";
import { Field } from "@/features/fields/types";
import { Tooltip } from "@chakra-ui/react";
import { getForeignName } from "./helpers";
import { useAppRouter } from "@/hooks";
import { useGetRecordQuery } from "@/features/records/api-slice";
import Link from "next/link";
import React, { memo } from "react";
import Shimmer from "@/components/Shimmer";
import ShowFieldWrapper from "@/features/fields/components/FieldWrapper/ShowFieldWrapper";

const Show = ({ field }: { field: Field }) => {
  const { dataSourceId, tableName, viewId, recordId } = useAppRouter();

  const foreignTableName = field.column.foreignKeyInfo.foreignTableName as string;
  const foreignRecordId = field.value || null;
  const {
    data: recordResponse,
    error,
    isLoading,
  } = useGetRecordQuery(
    {
      dataSourceId,
      tableName: foreignTableName,
      recordId: foreignRecordId as string,
    },
    { skip: !dataSourceId || !foreignTableName || !foreignRecordId }
  );

  let href = `/data-sources/${dataSourceId}/tables/${foreignTableName}/${field.value}`;
  if (viewId) {
    href = `${href}/?fromView=${viewId}&fromRecord=${recordId}`;
  } else {
    href = `${href}/?fromTable=${tableName}&fromRecord=${recordId}`;
  }

  return (
    <ShowFieldWrapper field={field}>
      {isLoading && <Shimmer height={32} />}
      {isLoading || (
        <>
          {getForeignName(recordResponse?.data, field) || field.value}
          <Link
            href={href}
          >
            <a title="Go to record">
              <Tooltip label="Go to record">
                <span className="inline-flex">
                  <ArrowRightIcon className="inline-block underline text-blue-600 cursor-pointer h-4" />
                </span>
              </Tooltip>
            </a>
          </Link>
        </>
      )}
    </ShowFieldWrapper>
  );
};

export default memo(Show);

import { ArrowRightIcon } from "@heroicons/react/outline";
import { Field } from "@/features/fields/types";
import { Tooltip } from "@chakra-ui/react";
import { getForeignName } from "./helpers";
import { useDataSourceContext } from "@/hooks";
import { useGetRecordQuery } from "@/features/records/api-slice";
import IndexFieldWrapper from "@/features/fields/components/FieldWrapper/IndexFieldWrapper";
import Link from "next/link";
import React, { memo } from "react";
import Shimmer from "@/components/Shimmer";

const Index = ({ field }: { field: Field }) => {
  const { dataSourceId } = useDataSourceContext();
  const foreignTableName = field.column.foreignKeyInfo
    .foreignTableName as string;
  const foreignRecordId = field.value || null;
  const {
    data: recordResponse,
    isLoading,
  } = useGetRecordQuery(
    {
      dataSourceId,
      tableName: foreignTableName,
      recordId: foreignRecordId as string,
    },
    { skip: !dataSourceId || !foreignTableName || !foreignRecordId }
  );

  return (
    <IndexFieldWrapper field={field}>
      {isLoading && <Shimmer height={16.5} />}
      {isLoading || (
        <>
          {getForeignName(recordResponse?.data, field) || field.value}
          <Link
            href={`/data-sources/${dataSourceId}/tables/${foreignTableName}/${field.value}`}
          >
            <a
              title="Go to record"
              className="ml-1 text-blue-600 cursor-pointer"
            >
              <Tooltip label="Go to record">
                <span className="inline-flex">
                  <ArrowRightIcon className="inline-block h-3 pt-1" />
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

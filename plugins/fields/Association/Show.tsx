import { ArrowRightIcon } from "@heroicons/react/outline";
import { Field } from "@/features/fields/types";
import { Tooltip } from "@chakra-ui/react";
import { getForeignName } from "./helpers";
import { useDataSourceContext } from "@/hooks";
import { useGetRecordQuery } from "@/features/records/api-slice";
import Link from "next/link";
import React, { memo } from "react";
import Shimmer from "@/components/Shimmer";
import ShowFieldWrapper from "@/features/fields/components/FieldWrapper/ShowFieldWrapper";

const Show = ({ field }: { field: Field }) => {
  const { dataSourceId } = useDataSourceContext();

  const foreignTableName = field.column.foreignKeyInfo.foreignTableName as string;
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
    <ShowFieldWrapper field={field}>
      {isLoading && <Shimmer height={32} />}
      {isLoading || (
        <>
          {getForeignName(recordResponse?.data, field) || field.value}
          <Link
            href={`/data-sources/${dataSourceId}/tables/${foreignTableName}/${field.value}`}
          >
            <a title="Go to record">
              <Tooltip label="Go to record">
                <span className="inline-flex">
                  <ArrowRightIcon className="inline-block underline text-blue-600 cursor-pointer ml-1 h-4 pt-1" />
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

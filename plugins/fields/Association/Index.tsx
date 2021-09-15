import { ArrowRightIcon } from "@heroicons/react/outline";
import { Field } from "@/features/fields/types";
import { Tooltip } from "@chakra-ui/react";
import IndexFieldWrapper from "@/features/fields/components/FieldWrapper/IndexFieldWrapper";
import Link from "next/link";
import React, { memo } from "react";
import router from "next/router";

const Index = ({ field }: { field: Field }) => (
  <IndexFieldWrapper field={field}>
    {field.value}
    <Link
      href={`/data-sources/${router.query.dataSourceId}/tables/${field.column.foreignKeyInfo.foreignTableName}/${field.value}?fromTable=${router.query.tableName}`}
    >
      <a title="Go to record" className="ml-1 text-blue-600 cursor-pointer">
        <Tooltip label="Go to record">
          <span className="inline-flex">
            <ArrowRightIcon className="inline-block h-4" />
          </span>
        </Tooltip>
      </a>
    </Link>
  </IndexFieldWrapper>
);

export default memo(Index);

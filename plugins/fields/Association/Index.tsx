import { ArrowRightIcon } from "@heroicons/react/outline";
import { Field } from "@/features/fields/types";
import { Tooltip } from "@chakra-ui/react";
import IndexFieldWrapper from "@/features/fields/components/FieldWrapper/IndexFieldWrapper";
import Link from "next/link";
import React, { memo, useMemo } from "react";

const Index = ({ field }: { field: Field }) => {
  const { value, dataSourceId, foreignTable, foreignId } = useMemo(() => {
    const valueObject = JSON.parse(field.value as string);

    return valueObject;
  }, [field.value]);

  return (
    <IndexFieldWrapper field={field}>
      {value}
      <Link
        href={`/data-sources/${dataSourceId}/tables/${foreignTable}/${foreignId}`}
      >
        <a title="Go to record" className="ml-1 text-blue-600 cursor-pointer">
          <Tooltip label="Go to record">
            <span className="inline-flex">
              <ArrowRightIcon className="inline-block h-3 pt-1" />
            </span>
          </Tooltip>
        </a>
      </Link>
    </IndexFieldWrapper>
  );
};

export default memo(Index);

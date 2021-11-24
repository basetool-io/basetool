import { ArrowRightIcon } from "@heroicons/react/outline";
import { Field } from "@/features/fields/types";
import { Tooltip } from "@chakra-ui/react";
import Link from "next/link";
import React, { memo, useMemo } from "react";
import ShowFieldWrapper from "@/features/fields/components/FieldWrapper/ShowFieldWrapper";

const Show = ({ field }: { field: Field }) => {
  const { value, dataSourceId, foreignTable, foreignId } = useMemo(() => {
    const valueObject = JSON.parse(field.value as string);

    return valueObject;
  }, [field.value]);

  return (
    <ShowFieldWrapper field={field}>
      {value}
      <Link
        href={`/data-sources/${dataSourceId}/tables/${foreignTable}/${foreignId}`}
      >
        <a title="Go to record">
          <Tooltip label="Go to record">
            <span className="inline-flex">
              <ArrowRightIcon className="inline-block underline text-blue-600 cursor-pointer ml-1 h-4 pt-1" />
            </span>
          </Tooltip>
        </a>
      </Link>
    </ShowFieldWrapper>
  );
};

export default memo(Show);

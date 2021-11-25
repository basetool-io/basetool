import { ArrowRightIcon } from "@heroicons/react/outline";
import { Field, RecordAssociationValue } from "@/features/fields/types";
import { Tooltip } from "@chakra-ui/react";
import { isBoolean, isNumber, isString } from "lodash";
import IndexFieldWrapper from "@/features/fields/components/FieldWrapper/IndexFieldWrapper";
import Link from "next/link";
import React, { memo, useMemo } from "react";

const Index = ({ field }: { field: Field }) => {
  const { value, dataSourceId, foreignTable, foreignId } = useMemo(() => {
    let value, dataSourceId, foreignTable, foreignId;
    if (field.value) {
      try {
        const parsedFieldValue: RecordAssociationValue = JSON.parse(
          field.value as string
        );
        value = parsedFieldValue.value;
        dataSourceId = parsedFieldValue.dataSourceId;
        foreignTable = parsedFieldValue.foreignTable;
        foreignId = parsedFieldValue.foreignId;
      } catch (error) {
        if (
          isNumber(field.value) ||
          isString(field.value) ||
          isBoolean(field.value)
        ) {
          value = field.value;
        }
      }
    }

    return { value, dataSourceId, foreignTable, foreignId };
  }, [field.value]);

  const hasLink = useMemo(() => {
    return dataSourceId && foreignTable && foreignId;
  }, [dataSourceId, foreignTable, foreignId]);

  const RecordLink = () => (
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
  );

  return (
    <IndexFieldWrapper field={field}>
      {value}
      {hasLink && <RecordLink />}
    </IndexFieldWrapper>
  );
};

export default memo(Index);

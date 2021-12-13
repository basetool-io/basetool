import { Field, LinkToValue, LinkToValueItem } from "@/features/fields/types";
import GoToRecordLink from "@/features/fields/components/GoToRecordLink";
import React, { memo, useMemo } from "react";
import ShowFieldWrapper from "@/features/fields/components/FieldWrapper/ShowFieldWrapper";

const LinkToItem = ({ record }: { record: LinkToValueItem }) => {
  const href = null;

  return (
    <>
      {record.label} [{record.id}]{href && <GoToRecordLink href={href} />}
    </>
  );
};

const Show = ({ field }: { field: Field<LinkToValue> }) => {
  const hasRecords = useMemo(() => field.value?.length > 0, [field.value]);

  return (
    <>
      <ShowFieldWrapper field={field} inline>
        <div className="px-6">
          {hasRecords || "No records"}
          {hasRecords && (
            <ol className="list-decimal">
              {field.value.map((record) => (
                <li>
                  <LinkToItem record={record} />
                </li>
              ))}
            </ol>
          )}
        </div>
      </ShowFieldWrapper>
    </>
  );
};

export default memo(Show);

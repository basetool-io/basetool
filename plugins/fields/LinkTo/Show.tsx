import { Field } from "@/features/fields/types";
import { LinkToValueItem } from "./types";
import GoToRecord from "@/features/fields/components/GoToRecordLink";
import React, { memo, useMemo } from "react";
import ShowFieldWrapper from "@/features/fields/components/FieldWrapper/ShowFieldWrapper";

const LinkToItem = ({ record }: { record: LinkToValueItem }) => {
  const href = null;

  return (
    <>
      {record.label} [{record.id}]{href && <GoToRecord href={href} />}
    </>
  );
};

const Show = ({ field }: { field: Field<LinkToValueItem[]> }) => {
  const hasRecords = useMemo(() => field.value?.length > 0, [field.value]);
  const records = field.value;

  return (
    <>
      <ShowFieldWrapper field={field} inline>
        <div className="px-6">
          {hasRecords || "No records"}
          {hasRecords && (
            <ol className="list-decimal">
              {records.map((record, idx: number) => (
                <li key={idx}>
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

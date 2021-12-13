import { Field } from "@/features/fields/types";
import { Tooltip } from "@chakra-ui/react";
import { isArray } from "lodash";
import IndexFieldWrapper from "@/features/fields/components/FieldWrapper/IndexFieldWrapper";
import React, { memo, useMemo } from "react";
import pluralize from "pluralize";

type Association = {
  id: string;
  label: string;
};

const TooltipLabel = memo(({ records }: { records: Association[] }) => (
  <ol className="list-decimal list-inside">
    {records.length > 0 && records.map((record) => <li>{record.label}</li>)}
    {records.length === 0 && <>No associations</>}
  </ol>
));
TooltipLabel.displayName = "TooltipLabel";

const Index = ({ field }: { field: Field }) => {
  const records: Association[] = useMemo(
    () => (isArray(field?.value) ? field.value : []),
    [field?.value]
  );
  const recordsCount = useMemo(() => records.length || 0, [records]);

  return (
    <IndexFieldWrapper field={field}>
      <Tooltip label={<TooltipLabel records={records} />}>
        <div className="inline border-b border-dotted cursor-help">
          {recordsCount} {pluralize("record", recordsCount)}
        </div>
      </Tooltip>
    </IndexFieldWrapper>
  );
};

export default memo(Index);

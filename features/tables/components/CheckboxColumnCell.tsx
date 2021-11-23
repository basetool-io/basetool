import { Checkbox } from "@chakra-ui/react";
import { isUndefined } from "lodash";
import { useSelectRecords } from "@/features/records/hooks";
import React, { memo } from "react";

const CheckboxColumnCell = ({ id }: { id: number }) => {
  const { selectedRecords, toggleRecordSelection } = useSelectRecords();

  if (isUndefined(id)) return null;

  return (
    <div className="flex items-center justify-center h-full">
      <Checkbox
        colorScheme="gray"
        isChecked={selectedRecords.includes(id)}
        onChange={() => toggleRecordSelection(id)}
      />
    </div>
  );
};

export default memo(CheckboxColumnCell);

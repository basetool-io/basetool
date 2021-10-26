import { Checkbox } from "@chakra-ui/react";
import { Row } from "react-table";
import { useSelectRecords } from "@/features/records/hooks";
import React, { memo } from "react";

const CheckboxColumnCell = ({ row }: { row: Row<any> }) => {
  const { selectedRecords, toggleRecordSelection } = useSelectRecords();

  return (
    <div className="flex items-center justify-center h-full">
      <Checkbox
        colorScheme="gray"
        isChecked={selectedRecords.includes(row?.original?.id)}
        onChange={() => toggleRecordSelection(row?.original?.id)}
      />
    </div>
  );
};

export default memo(CheckboxColumnCell);

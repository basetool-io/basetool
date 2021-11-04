import { Checkbox } from "@chakra-ui/react";
import { Row } from "react-table";
import { iconForField } from "@/features/fields";
import { useSelectRecords } from "@/features/records/hooks";
import ItemControls from "./ItemControls";
import React, { memo, useMemo } from "react";
import classNames from "classnames";

const MobileIndexFieldWrapper = ({ cell }: { cell: any }) => {
  const column = useMemo(() => cell.column?.meta, [cell]);
  const IconElement = useMemo(() => iconForField(column), [column.fieldType]);

  return (
    <div className="td px-6 py-0 whitespace-nowrap text-sm text-gray-500 truncate">
      <div className="flex items-center space-x-2 md:min-h-16 md:py-4 -mb-3">
        <IconElement className="h-4 inline-block flex-shrink-0" />{" "}
        <span>{column.label}</span>
      </div>

      {cell.render("Cell")}
    </div>
  );
};

const MobileRow = ({ row }: { row: Row<any> }) => {
  const { selectedRecords, toggleRecordSelection } = useSelectRecords();

  return (
    <div
      className={classNames("flex flex-col w-full hover:bg-gray-100 bg-white")}
    >
      <div className="td px-6 py-2 whitespace-nowrap text-sm truncate flex justify-between">
        {row?.original?.id && (
          <>
            <Checkbox
              size="lg"
              colorScheme="gray"
              isChecked={selectedRecords.includes(row?.original?.id)}
              onChange={(e) => toggleRecordSelection(row?.original?.id)}
            />
            <ItemControls recordId={row?.original?.id} />
          </>
        )}
      </div>

      {row.cells
        // We won't render the column if there isn't a meta property. This cell could be the record selector cell.
        .filter((cell: any) => cell.column?.meta)
        .map((cell) => (
          <MobileIndexFieldWrapper cell={cell} />
        ))}
    </div>
  );
};

export default memo(MobileRow);

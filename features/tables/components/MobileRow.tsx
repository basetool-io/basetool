import { Checkbox } from "@chakra-ui/react";
import { Row } from "react-table";
import { iconForField } from "@/features/fields";
import { usePrefetch } from "@/features/records/api-slice";
import { useSelectRecords, useSidebarsVisible } from "@/hooks";
import ItemControls from "./ItemControls";
import React, { memo, useMemo } from "react";
import classNames from "classnames";

const IndexFieldWrapper = ({ cell }: { cell: any }) => {
  const column = useMemo(() => cell.column?.meta, [cell]);
  const IconElement = useMemo(() => iconForField(column), [column.fieldType]);

  return (
    <div className="td px-6 py-2 whitespace-nowrap text-sm text-gray-500 truncate">
      <div className="flex items-center space-x-2 md:min-h-16 md:py-4">
        <IconElement className="h-4 inline-block flex-shrink-0" />{" "}
        <span>{column.label}</span>
      </div>

      {cell.render("Cell")}
    </div>
  );
};

const MobileRow = ({
  row,
  dataSourceId,
  tableName,
  prepareRow,
  index,
}: {
  row: Row<any>;
  dataSourceId: string;
  tableName: string;
  prepareRow: (row: Row) => void;
  index: number;
}) => {
  const [sidebarsVisible, setSidebarVisible] = useSidebarsVisible();
  const prefetchRecord = usePrefetch("getRecord");
  prepareRow(row);

  const { selectedRecords, toggleRecordSelection } = useSelectRecords();

  return (
    <a
      // {...row.getRowProps()}
      onMouseOver={() => {
        const id = row.original?.id?.toString();

        if (id) {
          prefetchRecord({
            dataSourceId,
            tableName,
            recordId: row.original.id.toString(),
          });
        }
      }}
      className={classNames("flex flex-col w-full hover:bg-gray-100 border-b", {
        "bg-white": index % 2 === 0,
        "bg-gray-50": index % 2 !== 0,
      })}
      onClick={() => setSidebarVisible(false)}
    >
      <div className="td px-6 py-2 whitespace-nowrap text-sm text-gray-500 truncate flex justify-between">
        <Checkbox
          size="lg"
          colorScheme="gray"
          isChecked={selectedRecords.includes(row?.original?.id)}
          onChange={(e) => toggleRecordSelection(row?.original?.id)}
        />
        <ItemControls recordId={row?.original?.id} />
      </div>

      {row.cells.map((cell) => (
        <IndexFieldWrapper cell={cell} />
      ))}
    </a>
  );
};

export default memo(MobileRow);

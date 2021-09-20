import { Row } from "react-table";
import { iconForField } from "@/features/fields";
import { isUndefined } from "lodash";
import { usePrefetch } from "@/features/records/api-slice";
import { useSidebarsVisible } from "@/hooks";
import Link from "next/link"
import React, { useMemo } from "react";
import classNames from "classnames";

const IndexFieldWrapper = ({ cell }: { cell: any }) => {
  const column = useMemo(() => cell.column?.meta, [cell]);
  const IconElement = useMemo(
    () => iconForField(column),
    [column.fieldType]
  );

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

  const hasId = !isUndefined(row?.original?.id);
  const link = `/data-sources/${dataSourceId}/tables/${tableName}/${row.original.id}`;

  const rowContent = (
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
        "cursor-pointer": hasId,
      })}
      onClick={() => setSidebarVisible(false)}
    >
      {row.cells.map((cell) => (
        <IndexFieldWrapper cell={cell} />
      ))}
    </a>
  );

  if (hasId) {
    return <Link href={link}>{rowContent}</Link>;
  }

  return rowContent;
};

const RecordRow = ({
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

  const hasId = !isUndefined(row?.original?.id);
  const link = `/data-sources/${dataSourceId}/tables/${tableName}/${row.original.id}`;

  const rowContent = (
    <a
      {...row.getRowProps()}
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
      className={classNames("tr relative hover:bg-light-blue-50 border-b last:border-b-0", {
        "bg-white": index % 2 === 0,
        "bg-gray-50": index % 2 !== 0,
        "cursor-pointer": hasId,
      })}
      onClick={() => setSidebarVisible(false)}
    >
      {row.cells.map((cell) => (
        <div
          {...cell.getCellProps()}
          className="td px-6 py-2 whitespace-nowrap text-sm text-gray-500 truncate"
        >
          {cell.render("Cell")}
        </div>
      ))}
    </a>
  );

  if (hasId) {
    return <Link href={link}>{rowContent}</Link>;
  }

  return rowContent;
};

export { MobileRow, RecordRow };

import { Row } from "react-table";
import { isUndefined } from "lodash";
import { usePrefetch } from "@/features/records/api-slice";
import { useSidebarsVisible } from "@/hooks";
import Link from "next/link"
import React, { memo } from "react";
import classNames from "classnames";

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
      className={classNames("tr relative hover:bg-sky-50 border-b last:border-b-0", {
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

export default memo(RecordRow);

import { Row } from "react-table";
import { usePrefetch } from "@/features/records/api-slice";
import { useRouter } from "next/router"
import ItemControls from "./ItemControls";
import React, { memo, useRef } from "react";
import classNames from "classnames";
import useDoubleClick from 'use-double-click';

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
  const router = useRouter()
  const rowRef = useRef<any>();
  const prefetchRecord = usePrefetch("getRecord");
  useDoubleClick({
    onDoubleClick: async () => await router.push(`/data-sources/${router.query.dataSourceId}/tables/${router.query.tableName}/${row.original.id}`),
    ref: rowRef,
    latency: 250
  });
  prepareRow(row);

  return (
    <div
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
      className={classNames(
        "tr relative hover:bg-sky-50 border-b last:border-b-0",
        {
          "bg-white": index % 2 === 0,
          "bg-gray-50": index % 2 !== 0,
        }
      )}
      ref={rowRef}
    >
      {row.cells.map((cell) => (
        <div
          {...cell.getCellProps()}
          className="td px-6 py-2 whitespace-nowrap text-sm text-gray-500 truncate"
        >
          {cell.render("Cell")}
        </div>
      ))}
      <div className="td px-1 py-3 whitespace-nowrap text-sm text-gray-500">
        <ItemControls recordId={row?.original?.id} />
      </div>
    </div>
  );
};

export default memo(RecordRow);

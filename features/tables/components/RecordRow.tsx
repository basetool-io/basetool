import { Row } from "react-table";
import { usePrefetch } from "@/features/records/api-slice";
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
  const prefetchRecord = usePrefetch("getRecord");
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
    >
      {row.cells.map((cell) => (
        <div
          {...cell.getCellProps()}
          className="td px-6 py-2 whitespace-nowrap text-sm text-gray-500 truncate"
        >
          {cell.render("Cell")}
        </div>
      ))}
    </div>
  );
};

export default memo(RecordRow);

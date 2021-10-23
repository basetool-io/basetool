import { Row } from "react-table";
import { usePrefetch } from "@/features/records/api-slice";
import React, { memo } from "react";
import classNames from "classnames";

const RecordRow = ({
  row,
  dataSourceId,
  tableName,
  prepareRow,
}: {
  row: Row<any>;
  dataSourceId: string;
  tableName: string;
  prepareRow: (row: Row) => void;
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
      className={classNames("tr relative hover:bg-sky-50 bg-white")}
    >
      {row.cells.map((cell) => (
        <div {...cell.getCellProps()} className="td">
          {cell.render("Cell")}
        </div>
      ))}
    </div>
  );
};

export default memo(RecordRow);

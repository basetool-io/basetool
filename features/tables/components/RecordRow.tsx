import { Row } from "react-table";
import { columnWidthsSelector } from "@/features/records/state-slice";
import { useAppSelector } from "@/hooks";
import { usePrefetch } from "@/features/records/api-slice";
import React, { memo } from "react";
import classNames from "classnames";

const RecordRow = ({
  row,
  dataSourceId,
  tableName,
}: {
  row: Row<any>;
  dataSourceId: string;
  tableName: string;
}) => {
  const prefetchRecord = usePrefetch("getRecord");

  useAppSelector(columnWidthsSelector); // keep this so the columnWidths will trigger a change

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
      className={classNames("tr relative hover:bg-gray-50 bg-white")}
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

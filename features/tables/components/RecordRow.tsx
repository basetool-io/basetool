import { Row } from "react-table";
import { columnWidthsSelector } from "@/features/records/state-slice";
import { useAppSelector } from "@/hooks";
import React, { memo } from "react";
import classNames from "classnames";

const RecordRow = ({ row }: { row: Row<any> }) => {
  useAppSelector(columnWidthsSelector); // keep this so the columnWidths will trigger a change

  return (
    <div
      {...row.getRowProps()}
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

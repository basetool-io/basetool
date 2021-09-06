import { Column } from "@/features/fields/types";
import { iconForField } from "@/features/fields";
import React, { useMemo } from "react";
import classNames from "classnames";

const ColumnListItem = ({
  column,
  selectedColumn,
  setColumn,
}: {
  column: Column;
  selectedColumn?: Column;
  setColumn: (c: Column) => void;
}) => {
  const IconElement = useMemo(() => iconForField(column), [column.fieldType]);

  return (
    column && (
      <div
        className={classNames(
          "w-full cursor-pointer uppercase text-sm font-semibold rounded flex items-center p-1",
          {
            "bg-blue-500 text-white":
              selectedColumn && column.name === selectedColumn.name,
          }
        )}
        onClick={() => setColumn(column)}
      >
        {<IconElement className="inline h-4 mr-2" />}
        <span>
          {column.name}{" "}
          {column.baseOptions.required && <sup className="text-red-600">*</sup>}
        </span>
      </div>
    )
  );
};

export default ColumnListItem;

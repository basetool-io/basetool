import { Column } from "@/features/fields/types";
import { DecoratedView } from "@/features/views/types";
import { iconForField } from "@/features/fields";
import { selectColumnName, selectedColumnNameSelector } from "../state-slice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { useDataSourceContext } from "@/hooks";
import { useGetColumnsQuery } from "@/features/views/api-slice";
import DragIcon from "@/components/DragIcon";
import React, { useEffect, useState } from "react";
import TinyLabel from "@/components/TinyLabel";
import classNames from "classnames";

const ColumnItem = ({
  column,
  setColumn,
}: {
  column: Column;
  setColumn: (column: Column) => void;
}) => {
  const IconElement = iconForField(column);
  const dispatch = useAppDispatch();
  const selectedColumnName = useAppSelector(selectedColumnNameSelector);
  // const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <div
      className={classNames(
        "relative flex items-center justify-between cursor-pointer group rounded",
        {
          "bg-blue-600 text-white": selectedColumnName === column.name,
          "hover:bg-gray-100": selectedColumnName !== column.name,
        }
      )}
    >
      <div className="flex items-center flex-1">
        <DragIcon className="" />{" "}
        <div
          className="flex-1 flex items-center"
          onClick={() => dispatch(selectColumnName(column.name))}
        >
          <IconElement className="h-4 self-start mt-1 ml-1 mr-2 lg:self-center lg:mt-0 inline-block flex-shrink-0" />{" "}
          <span className="text-sm">{column.name}</span>
        </div>
        {/* <div className="absolute inset-auto right-0 hidden group-hover:block text-xs text-gray-600">click to edit</div> */}
      </div>

      {/* <ColumnModal
        column={column}
        setColumn={setColumn}
        isOpen={isOpen}
        onClose={onClose}
      /> */}
    </div>
  );
};

const ColumnsConfigurator = ({
  view,
  setView,
}: {
  view: DecoratedView;
  setView: (view: DecoratedView) => void;
}) => {
  const { viewId, dataSourceId, tableName } = useDataSourceContext();

  const { data: columnsResponse } = useGetColumnsQuery(
    {
      viewId,
    },
    { skip: !viewId }
  );

  const [columns, setColumns] = useState<Column[]>();
  useEffect(() => {
    setColumns(columnsResponse?.data);
  }, [columnsResponse?.data]);

  // const columns = columnsResponse?.data;
  const setColumn = (column: Column) => {
    console.log("setColumn->", column);
  };

  return (
    <div>
      <div className="flex justify-between">
        <TinyLabel>Columns</TinyLabel>{" "}
        <div className="text-xs text-gray-600">(click to edit)</div>
      </div>
      <div className="mt-2">
        {columns &&
          columns.map((column: Column) => (
            <ColumnItem column={column} setColumn={setColumn} />
          ))}
      </div>
      {/* <pre>{JSON.stringify([columns, view], null, 2)}</pre> */}
    </div>
  );
};

export default ColumnsConfigurator;

import { Checkbox } from "@chakra-ui/react";
import { Column } from "@/features/fields/types"
import {
  Row,
  useBlockLayout,
  useColumnOrder,
  useResizeColumns,
  useTable,
} from "react-table";
import {
  SortAscendingIcon,
  SortDescendingIcon,
} from "@heroicons/react/outline";
import {
  columnWidthsSelector,
  columnsSelector,
  recordsSelector,
} from "@/features/records/state-slice";
import { iconForField, prettifyData } from "@/features/fields";
import { parseColumns } from "..";
import { sortBy } from "lodash";
import { useAppSelector, useDataSourceContext, useResponsive } from "@/hooks";
import {
  useOrderRecords,
  useResizableColumns,
  useSelectRecords,
} from "@/features/records/hooks";
import Cell from "./Cell";
import CheckboxColumnCell from "./CheckboxColumnCell";
import ItemControlsCell from "./ItemControlsCell";
import MobileRow from "./MobileRow";
import React, { memo, useEffect, useMemo } from "react";
import RecordRow from "./RecordRow";
import classNames from "classnames";

const checkboxColumn = {
  Header: "selector_column",
  accessor: (row: any, i: number) => `selector_column_${i}`,
  // eslint-disable-next-line react/display-name
  Cell: (row: any) => <CheckboxColumnCell id={row?.row?.original?.id} />,
  width: 50,
  minWidth: 50,
  maxWidth: 50,
};

const controlsColumn = {
  Header: "controls_column",
  accessor: (row: any, i: number) => `controls_column_${i}`,
  // eslint-disable-next-line react/display-name
  Cell: (row: any) => <ItemControlsCell row={row.row} />,
  width: 104,
  minWidth: 104,
  maxWidth: 104,
};

const ErrorMessage = ({ error }: { error: string }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="max-w-md text-center">
        <div className="text-xl font-bold">Oh no, There's been an error...</div>
        <div className="mt-4">{error}</div>
      </div>
    </div>
  );
};

const RecordsTable = ({
  error,
  isFetching,
}: {
  error?: string;
  isFetching?: boolean;
}) => {
  const { isMd } = useResponsive();
  const { dataSourceId, tableName } = useDataSourceContext();

  // Display desktop or mobile record row
  const RowComponent = useMemo(() => (isMd ? RecordRow : MobileRow), [isMd]);

  // Get raw records and columsn from the data store
  const rawRecords = useAppSelector(recordsSelector);
  const rawColumns = useAppSelector(columnsSelector);

  const hasRecords = useMemo(() => rawRecords.length > 0, [rawRecords]);

  const hasIdColumn = useMemo(
    () => rawColumns.find((col) => col.name === "id"),
    [rawColumns]
  );

  const columnWidths = useAppSelector(columnWidthsSelector);
  // Process the records and columns to their final form.
  const records = useMemo(() => prettifyData(rawRecords), [rawRecords]);
  // Memoize and add the start and end columns

  const orderedColumns = useMemo(() => {
    const result = parseColumns({
      columns: rawColumns.filter((column: Column) => !column?.baseOptions?.disconnected),
      columnWidths,
    });

    return sortBy(result, [
      (reactTableColumn: any) =>
        reactTableColumn?.meta?.baseOptions?.orderIndex,
    ]);
  }, [rawColumns, columnWidths]);

  const columns = useMemo(() => {
    if (hasIdColumn) {
      return [checkboxColumn, ...orderedColumns, controlsColumn];
    } else {
      return [...orderedColumns];
    }
  }, [rawColumns]);

  // Init table
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
    state,
  } = useTable(
    {
      columns: columns as [],
      data: records,
      defaultColumn: {
        Cell,
      },
    },
    useColumnOrder,
    useBlockLayout,
    useResizeColumns
  );

  const updateColumnWidths = useResizableColumns({ dataSourceId, tableName });
  useEffect(() => {
    updateColumnWidths({ state, columnWidths });
  }, [state?.columnResizing, columnWidths]);

  const {
    allColumnsChecked,
    setRecordsSelected,
    resetRecordsSelection,
    selectAllIsIndeterminate,
  } = useSelectRecords();

  const setCheckedItems = (checked: boolean) => {
    if (checked) {
      const ids = records.map((record) => record?.id);
      setRecordsSelected(ids);
    } else {
      resetRecordsSelection();
    }
  };

  useEffect(() => {
    resetRecordsSelection();
  }, [records]);

  const { orderBy, orderDirection, handleOrder } = useOrderRecords();

  return (
    <div className="relative flex flex-col justify-between h-full w-full">
      {error && <ErrorMessage error={error} />}
      {!hasRecords && !error && (
        <div className="flex flex-1 justify-center items-center text-lg font-semibold text-gray-600 h-full">
          No records found
        </div>
      )}
      {hasRecords && !error && (
        <div className="flex">
          <div
            className={
              "table-widget relative divide-y bg-true-gray-200 divide-true-gray-200 overflow-auto w-full"
            }
            {...getTableProps()}
          >
            {isMd && (
              <div className="bg-true-gray-200 rounded-t">
                {headerGroups.map((headerGroup) => (
                  <div
                    {...headerGroup.getHeaderGroupProps()}
                    className="tr flex group"
                  >
                    {headerGroup.headers.map((column: any) => {
                      const isRecordSelectorColumn =
                        column.Header === "selector_column";
                      const isControlsColumn =
                        column.Header === "controls_column";

                      const IconElement = column?.meta
                        ? iconForField(column.meta)
                        : null;

                      return (
                        <div
                          {...column.getHeaderProps()}
                          className={classNames(
                            "relative flex h-full th text-left text-xs font-semibold uppercase text-blue-gray-500 tracking-tight leading-none",
                            {
                              "pl-4": !isRecordSelectorColumn,
                            }
                          )}
                        >
                          {isRecordSelectorColumn && (
                            <div className="flex items-center justify-center h-4 py-4">
                              <Checkbox
                                colorScheme="gray"
                                className="border-gray-400"
                                isChecked={allColumnsChecked}
                                isIndeterminate={selectAllIsIndeterminate}
                                onChange={(e: any) =>
                                  setCheckedItems(e.target.checked)
                                }
                              />
                            </div>
                          )}
                          {isControlsColumn || isRecordSelectorColumn || (
                            <div
                              className="flex items-center header-content overflow-hidden whitespace-nowrap cursor-pointer py-4 h-4"
                              onClick={() =>
                                !isRecordSelectorColumn &&
                                handleOrder(column.meta.name)
                              }
                            >
                              {IconElement && (
                                <IconElement className="h-3 inline-flex flex-shrink-0 mr-2" />
                              )}
                              <span className="inline-block leading-none">
                                <>
                                  {column.render("Header")}
                                  {column?.meta &&
                                    column.meta.name === orderBy && (
                                      <>
                                        {orderDirection === "desc" && (
                                          <SortDescendingIcon className="h-4 inline-flex" />
                                        )}
                                        {orderDirection === "asc" && (
                                          <SortAscendingIcon className="h-4 inline-flex" />
                                        )}
                                      </>
                                    )}
                                </>
                              </span>
                            </div>
                          )}
                          <div
                            {...column.getResizerProps()}
                            className={classNames("opacity-10", {
                              "resizer group-hover:opacity-100":
                                !isRecordSelectorColumn,
                              isResizing: column.isResizing,
                            })}
                          >
                            <div className="resizer-bar" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
            {rows.map((row: Row<any>, index) => {
              prepareRow(row);

              const component = <RowComponent row={row} />;

              return (
                <div key={index}>
                  {isMd || component}
                  {isMd && (
                    <div {...getTableBodyProps()} className="bg-white">
                      {component}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(RecordsTable);

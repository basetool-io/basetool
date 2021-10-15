import { Column as BaseToolColumn } from "@/features/fields/types";
import { Button, Checkbox } from "@chakra-ui/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SortAscendingIcon,
  SortDescendingIcon,
} from "@heroicons/react/outline";
import { OrderDirection } from "../types";
import {
  Row,
  useBlockLayout,
  useColumnOrder,
  useResizeColumns,
  useTable,
} from "react-table";
import { Views } from "@/features/fields/enums";
import {
  columnWidthsSelector,
  columnsSelector,
  recordsSelector,
  resetState,
} from "@/features/records/state-slice";
import { getField } from "@/features/fields/factory";
import { iconForField, makeField } from "@/features/fields";
import { isEmpty } from "lodash";
import { parseColumns } from "..";
import { prettifyData } from "@/features/fields";
import {
  useAppDispatch,
  useAppSelector,
  useColumns,
  useFilters,
  useOrderRecords,
  usePagination,
  useRecords,
  useResizableColumns,
  useResponsive,
  useSelectRecords,
} from "@/hooks";
import { useGetColumnsQuery } from "../api-slice";
import { useGetDataSourceQuery } from "@/features/data-sources/api-slice";
import { useGetRecordsQuery } from "@/features/records/api-slice";
import { useRouter } from "next/router";
import ItemControls from "@/features/tables/components/ItemControls";
import LoadingOverlay from "@/components/LoadingOverlay";
import MobileRow from "./MobileRow";
import React, { memo, useEffect, useMemo } from "react";
import RecordRow from "./RecordRow";
import classNames from "classnames";
import numeral from "numeral";

const Cell = memo(
  ({
    row,
    column,
    tableName,
  }: {
    row: Row;
    column: { meta: BaseToolColumn };
    tableName: string;
  }) => {
    const field = makeField({
      record: row.original,
      column: column?.meta,
      tableName,
    });
    const Element = getField(column.meta, Views.index);

    return <Element field={field} />;
  }
);

const TheTable = memo(() => {
  const router = useRouter();
  const { isMd } = useResponsive();
  const dataSourceId = router.query.dataSourceId as string;
  const tableName = router.query.tableName as string;
  // Display desktop or mobile record row
  const RowComponent = useMemo(() => (isMd ? RecordRow : MobileRow), [isMd]);

  // Get raw records and columsn from the data store
  const rawRecords = useAppSelector(recordsSelector);
  const rawColumns = useAppSelector(columnsSelector);

  const checkboxColumn = {
    Header: "selector_column",
    accessor: (row: any, i: number) => `selector_column_${i}`,
    Cell: CheckboxColumnCell,
    width: 70,
    minWidth: 70,
    maxWidth: 70,
  };

  const controlsColumn = {
    Header: "controls_column",
    accessor: (row: any, i: number) => `controls_column_${i}`,
    // eslint-disable-next-line react/display-name
    Cell: (row: any) => (
      <SelectorColumnCell row={row.row} dataSourceId={dataSourceId} />
    ),
    width: 104,
    minWidth: 104,
    maxWidth: 104,
  };

  const columnWidths = useAppSelector(columnWidthsSelector);
  // Process the records and columns to their final form.
  const records = useMemo(() => prettifyData(rawRecords), [rawRecords]);
  // Memoize and add the start and end columns
  const columns = useMemo(
    () => [
      checkboxColumn,
      ...parseColumns({
        columns: rawColumns,
        columnWidths,
      }),
      controlsColumn,
    ],
    [rawColumns]
  );

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
    <div
      className={
        "table-widget relative divide-y bg-blue-gray-100 divide-blue-gray-100 overflow-auto w-full md:w-auto"
      }
      {...getTableProps()}
    >
      {isMd && (
        <div className="bg-blue-gray-100 rounded-t">
          {headerGroups.map((headerGroup) => (
            <div
              {...headerGroup.getHeaderGroupProps()}
              className="tr flex group"
            >
              {headerGroup.headers.map((column: any) => {
                const isRecordSelectorColumn =
                  column.Header === "selector_column";
                const isControlsColumn = column.Header === "controls_column";

                const IconElement = column?.meta
                  ? iconForField(column.meta)
                  : () => "" as any;

                return (
                  <div
                    {...column.getHeaderProps()}
                    className="relative flex h-full th px-6 text-left text-xs font-semibold uppercase text-blue-gray-500 tracking-tight leading-none"
                  >
                    {isRecordSelectorColumn && (
                      <div className="flex items-center justify-center h-4 py-4">
                        <Checkbox
                          colorScheme="gray"
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
                        <IconElement className="h-3 inline-block mr-2" />
                        <span className="inline-block leading-none">
                          <>
                            {column.render("Header")}
                            {column?.meta && column.meta.name === orderBy && (
                              <>
                                {orderDirection === "desc" && (
                                  <SortDescendingIcon className="h-4 inline" />
                                )}
                                {orderDirection === "asc" && (
                                  <SortAscendingIcon className="h-4 inline" />
                                )}
                              </>
                            )}
                          </>
                        </span>
                      </div>
                    )}
                    <div
                      {...column.getResizerProps()}
                      className={classNames(
                        "resizer group-hover:opacity-100 opacity-20",
                        {
                          isResizing: column.isResizing,
                        }
                      )}
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

        const component = (
          <RowComponent
            key={index}
            row={row}
            dataSourceId={dataSourceId}
            tableName={tableName}
          />
        );

        return (
          <>
            {isMd || component}
            {isMd && <div {...getTableBodyProps()}>{component}</div>}
          </>
        );
      })}
    </div>
  );
});

const CheckboxColumnCell = ({ row }: { row: Row<any> }) => {
  const { selectedRecords, toggleRecordSelection } = useSelectRecords();

  return (
    <div className="flex items-center justify-center h-full">
      <Checkbox
        colorScheme="gray"
        isChecked={selectedRecords.includes(row?.original?.id)}
        onChange={() => toggleRecordSelection(row?.original?.id)}
      />
    </div>
  );
};

const SelectorColumnCell = ({
  row,
  dataSourceId,
}: {
  row: Row<any>;
  dataSourceId: string;
}) => (
  <div className="flex items-center justify-center h-full">
    <ItemControls recordId={row?.original?.id} dataSourceId={dataSourceId} />
  </div>
);

const RecordsTable = ({
  dataSourceId,
  tableName,
}: {
  dataSourceId?: string;
  tableName?: string;
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  // @todo: Get filters from the URL param
  const { encodedFilters } = useFilters();
  dataSourceId ||= router.query.dataSourceId as string;
  tableName ||= router.query.tableName as string;
  const { data: dataSourceResponse } = useGetDataSourceQuery(
    { dataSourceId },
    {
      skip: !dataSourceId,
    }
  );

  const { orderBy, orderDirection } = useOrderRecords(
    router.query.orderBy as string,
    router.query.orderDirection as OrderDirection
  );
  const { limit, offset } = usePagination();

  const {
    data: recordsResponse,
    error: recordsError,
    isLoading,
    isFetching,
  } = useGetRecordsQuery({
    dataSourceId,
    tableName,
    filters: encodedFilters,
    limit: limit.toString(),
    offset: offset.toString(),
    orderBy: orderBy ? orderBy : "",
    orderDirection: orderDirection ? orderDirection : "",
  });

  const { data: columnsResponse } = useGetColumnsQuery(
    {
      dataSourceId,
      tableName,
    },
    {
      skip:
        !dataSourceId ||
        !tableName ||
        !dataSourceResponse?.meta?.dataSourceInfo?.supports?.columnsRequest,
    }
  );

  const { records } = useRecords(recordsResponse?.data, recordsResponse?.meta);
  useColumns({
    dataSourceResponse,
    dataResponse: recordsResponse,
    columnsResponse,
    tableName,
  });

  const hasRecords = useMemo(() => records.length > 0, [records]);
  const tableIsVisible = useMemo(() => {
    return !isLoading && hasRecords;
  }, [isLoading, hasRecords]);

  // Reset data store on dismount.
  useEffect(() => {
    return () => {
      dispatch(resetState);
    };
  }, []);

  // Reset data store on table change.
  useEffect(() => {
    return () => {
      dispatch(resetState);
    };
  }, [tableName]);

  const PaginationComponent = useMemo(() => {
    switch (dataSourceResponse?.meta?.dataSourceInfo?.pagination) {
      default:
      case "offset":
        return OffsetPagination;
      case "cursor":
        return CursorPagination;
    }
  }, [dataSourceResponse?.meta?.dataSourceInfo?.pagination]);

  return (
    <div className="relative flex flex-col justify-between h-full w-full">
      {isFetching && (
        <LoadingOverlay transparent={isEmpty(recordsResponse?.data)} />
      )}
      {recordsError && <div>Error: {JSON.stringify(recordsError)}</div>}
      {tableIsVisible && <TheTable />}
      {tableIsVisible || (
        <>
          {!isFetching && !hasRecords && (
            <div className="flex flex-1 justify-center items-center text-lg font-semibold text-gray-600">
              No records found
            </div>
          )}
        </>
      )}
      <PaginationComponent />
    </div>
  );
};

const OffsetPagination = memo(() => {
  const {
    page,
    perPage,
    offset,
    nextPage,
    previousPage,
    maxPages,
    canPreviousPage,
    canNextPage,
    recordsCount,
  } = usePagination();

  return (
    <nav
      className="bg-white px-4 py-3 flex items-center justify-evenly border-t border-gray-200 sm:px-6 rounded-b"
      aria-label="Pagination"
    >
      <div className="flex-1 flex justify-start">
        <div className="inline-block text-gray-500 text-sm">
          Showing {offset + 1}-{perPage * page} {recordsCount && "of "}
          {recordsCount
            ? `${
                recordsCount < 1000
                  ? recordsCount
                  : numeral(recordsCount).format("0.0a")
              } in total`
            : ""}
        </div>
      </div>
      <div>
        <div className="flex justify-between sm:justify-end">
          <Button
            size="sm"
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
          >
            <ChevronLeftIcon className="h-4 text-gray-600" />
          </Button>
          <div className="flex items-center px-2 space-x-1">
            <span className="text-gray-500 mr-1">page</span> {page}{" "}
            <span className="pl-1">
              of {maxPages < 1000 ? maxPages : numeral(maxPages).format("0.0a")}
            </span>
          </div>
          <Button size="sm" onClick={() => nextPage()} disabled={!canNextPage}>
            <ChevronRightIcon className="h-4 text-gray-600" />
          </Button>
        </div>
      </div>
      <div className="flex-1 flex justify-end"></div>
    </nav>
  );
});

OffsetPagination.displayName = "OffsetPagination";

const CursorPagination = memo(() => {
  const {
    page,
    perPage,
    offset,
    nextPage,
    previousPage,
    maxPages,
    canPreviousPage,
    canNextPage,
    recordsCount,
  } = usePagination();

  return (
    <nav
      className="bg-white px-4 py-3 flex items-center justify-evenly border-t border-gray-200 sm:px-6 rounded-b"
      aria-label="Pagination"
    >
      <div className="flex-1 flex justify-start">
        <div className="inline-block text-gray-500 text-sm">
          Showing {offset + 1}-{perPage * page} {recordsCount && "of "}
          {recordsCount
            ? `${
                recordsCount < 1000
                  ? recordsCount
                  : numeral(recordsCount).format("0.0a")
              } in total`
            : ""}
        </div>
      </div>
      <div>
        <div className="flex justify-between sm:justify-end">
          <Button
            size="sm"
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
          >
            <ChevronLeftIcon className="h-4 text-gray-600" />
          </Button>
          <div className="flex items-center px-2 space-x-1">
            <span className="text-gray-500 mr-1">page</span> {page}{" "}
            <span className="pl-1">
              of {maxPages < 1000 ? maxPages : numeral(maxPages).format("0.0a")}
            </span>
          </div>
          <Button size="sm" onClick={() => nextPage()} disabled={!canNextPage}>
            <ChevronRightIcon className="h-4 text-gray-600" />
          </Button>
        </div>
      </div>
      <div className="flex-1 flex justify-end"></div>
    </nav>
  );
});

CursorPagination.displayName = "CursorPagination";

export default memo(RecordsTable);

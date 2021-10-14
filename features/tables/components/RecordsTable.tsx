import { Column as BaseToolColumn, Column } from "@/features/fields/types";
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
  orderSelector,
  recordsSelector,
} from "@/features/records/state-slice";
import { getField } from "@/features/fields/factory";
import { iconForField, makeField } from "@/features/fields";
import { isArray, isEmpty } from "lodash";
import { parseColumns } from "..";
import { prettifyData } from "@/features/fields";
import {
  useAppDispatch,
  useAppSelector,
  useColumns,
  useFilters,
  useMeta,
  useOrderRecords,
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
import React, { memo, useEffect, useMemo, useState } from "react";
import RecordRow from "./RecordRow";
import classNames from "classnames";
import numeral from "numeral";

const DEFAULT_PER_PAGE = 24;

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
  const RowComponent = useMemo(() => (isMd ? RecordRow : MobileRow), [isMd]);
  const dataSourceId = router.query.dataSourceId as string;
  const tableName = router.query.tableName as string;
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

  const updateState = useResizableColumns({ dataSourceId, tableName });
  useEffect(() => {
    updateState({ state, columnWidths });
  }, [state?.columnResizing, columnWidths]);

  const {
    selectedRecords,
    allColumnsChecked,
    setRecordsSelected,
    resetRecordsSelection,
  } = useSelectRecords();
  const isIndeterminate = selectedRecords.length > 0 && !allColumnsChecked;

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
                          isIndeterminate={isIndeterminate}
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

const usePagination = ({ perPage }: { perPage: number }) => {
  const router = useRouter();

  const [page, setPage] = useState<number>(
    router.query.page ? parseInt(router.query.page as string, 10) : 1
  );

  const [limit, offset] = useMemo(() => {
    const limit: number = perPage;
    const offset = page === 1 ? 0 : (page - 1) * limit;

    return [perPage, offset];
  }, [page]);

  const nextPage = () => {
    const nextPageNumber = page + 1;

    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        page: nextPageNumber,
      },
    });
    setPage(nextPageNumber);
  };

  const previousPage = () => {
    let nextPageNumber = page - 1;
    if (nextPageNumber <= 0) nextPageNumber = 1;

    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        page: nextPageNumber,
      },
    });
    setPage(nextPageNumber);
  };

  return { page, limit, offset, nextPage, previousPage, setPage };
};

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
  console.log("RecordsTable->");

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

  const [orderBy, setOrderBy] = useAppSelector(orderSelector);
  // router.query.orderBy as string
  const [orderDirection, setOrderDirection] = useState<OrderDirection>(
    router.query.orderDirection as OrderDirection
  );
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const { page, limit, offset, nextPage, previousPage, setPage } =
    usePagination({
      perPage,
    });

  const {
    data: recordsResponse,
    error: recordsError,
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

  const {
    data: columnsResponse,
    error: columnsError,
    isLoading,
  } = useGetColumnsQuery(
    {
      dataSourceId,
      tableName,
    },
    {
      skip: !dataSourceId || !tableName,
    }
  );
  // const columns = useAppSelector(columnsSelector);
  const { columns, setColumns } = useColumns();

  // const columns = useMemo(() => [], [])

  useEffect(() => {
    let columns: Column[] = [];

    if (
      dataSourceResponse?.ok &&
      dataSourceResponse?.meta?.dataSourceInfo?.requests?.columns === false
    ) {
      if (recordsResponse?.ok) {
        columns = recordsResponse?.meta?.columns;
      }
    } else {
      if (columnsResponse?.ok) {
        columns = columnsResponse?.data;
      }
    }

    if (isArray(columns)) {
      setColumns(columns as []);
    }
  }, [recordsResponse?.ok, dataSourceResponse?.ok, columnsResponse?.ok]);

  const { records, setRecords } = useRecords(recordsResponse?.data);
  const {
    meta,
  }: {
    meta: any;
  } = useMeta(recordsResponse?.meta);

  const maxPages = useMemo(() => {
    if (meta?.count) {
      return Math.ceil(meta?.count / perPage);
    }

    return 1;
  }, [meta?.count]);

  const canPreviousPage = useMemo(() => page > 1, [page]);
  const canNextPage = useMemo(() => page < maxPages, [page, maxPages]);

  // const {
  //   getTableProps,
  //   getTableBodyProps,
  //   headerGroups,
  //   prepareRow,
  //   rows,
  //   state,
  // } = useTable(
  //   {
  //     // columns: parsedColumns,
  //     columns: [],
  //     data,
  //     defaultColumn: {
  //       Cell,
  //     },
  //   },
  //   useColumnOrder,
  //   useBlockLayout,
  //   useResizeColumns
  // );

  // useEffect(() => {
  //   // Keep the column sizes in localStorage
  //   Object.entries(state.columnResizing.columnWidths).forEach(
  //     ([columnName, width]: [string, unknown]) => {
  //       const localStorageKey = localStorageColumnWidthsKey({
  //         dataSourceId: dataSourceId as string,
  //         tableName: tableName as string,
  //         columnName,
  //       });
  //       window.localStorage.setItem(
  //         localStorageKey,
  //         (width as number).toString()
  //       );
  //     }
  //   );
  // }, [state]);

  const [isValid, setIsValid] = useState(true);
  const [hasColumns, setHasColumns] = useState(true);
  const [tableIsVisible, setTableIsVisible] = useState(true);

  // const handleOrder = (columnName: string) => {
  //   let newOrderDirection: OrderDirection = "";
  //   let newOrderBy = "";

  //   if (orderBy !== columnName) {
  //     newOrderDirection = "asc";
  //     newOrderBy = columnName;
  //   } else {
  //     switch (orderDirection) {
  //       default:
  //       case "":
  //         newOrderDirection = "asc";
  //         newOrderBy = columnName;
  //         break;
  //       case "asc":
  //         newOrderDirection = "desc";
  //         newOrderBy = columnName;
  //         break;
  //       case "desc":
  //         newOrderDirection = "";
  //         newOrderBy = "";
  //         break;
  //     }
  //   }

  //   setOrderDirection(newOrderDirection);
  //   setOrderBy(newOrderBy);

  //   const query = { ...router.query };
  //   if (newOrderBy) {
  //     query.orderBy = newOrderBy;
  //   } else {
  //     delete query.orderBy;
  //   }
  //   if (newOrderDirection) {
  //     query.orderDirection = newOrderDirection;
  //   } else {
  //     delete query.orderDirection;
  //   }

  //   router.push({
  //     pathname: router.pathname,
  //     query,
  //   });
  // };

  const { isMd } = useResponsive();

  // const RowComponent = useMemo(() => (isMd ? RecordRow : MobileRow), [isMd]);

  // const { selectedRecords, setRecordsSelected, resetRecordsSelection } =
  // useSelectRecords();

  // const allColumnsChecked = useAppSelector(allColumnsCheckedSelector)
  // const isIndeterminate = selectedRecords.length > 0 && !allColumnsChecked;

  // const setCheckedItems = (checked: boolean) => {
  //   if (checked) {
  //     const ids = data.map((record) => record?.id);
  //     setRecordsSelected(ids);
  //   } else {
  //     resetRecordsSelection();
  //   }
  // };

  // useEffect(() => {
  //   resetRecordsSelection();
  // }, [data]);

  // Reset page to 1 when modifying filters.
  useEffect(() => {
    setPage(1);
  }, [encodedFilters]);

  return (
    <div className="relative flex flex-col justify-between h-full w-full">
      {isFetching && (
        <LoadingOverlay transparent={isEmpty(recordsResponse?.data)} />
      )}
      {recordsError && <div>Error: {JSON.stringify(recordsError)}</div>}
      {!isFetching && !isValid && (
        <div className="flex flex-1 justify-center items-center text-lg font-semibold text-gray-600">
          No rows found
        </div>
      )}

      {!hasColumns && isValid && (
        <div className="flex flex-1 justify-center items-center text-lg font-semibold text-gray-600">
          All columns are hidden
        </div>
      )}
      {tableIsVisible && <TheTable />}
      <nav
        className="bg-white px-4 py-3 flex items-center justify-evenly border-t border-gray-200 sm:px-6 rounded-b"
        aria-label="Pagination"
      >
        <div className="flex-1 flex justify-start">
          <div className="inline-block text-gray-500 text-sm">
            Showing {offset + 1}-{perPage * page} {meta?.count && "of "}
            {meta?.count
              ? `${
                  meta.count < 1000
                    ? meta.count
                    : numeral(meta.count).format("0.0a")
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
                of{" "}
                {maxPages < 1000 ? maxPages : numeral(maxPages).format("0.0a")}
              </span>
            </div>
            <Button
              size="sm"
              onClick={() => nextPage()}
              disabled={!canNextPage}
            >
              <ChevronRightIcon className="h-4 text-gray-600" />
            </Button>
          </div>
        </div>
        <div className="flex-1 flex justify-end"></div>
      </nav>
    </div>
  );
};

export default memo(RecordsTable);

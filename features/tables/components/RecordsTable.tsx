import { Checkbox } from "@chakra-ui/react";
import { OrderDirection } from "../types";
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
  resetState,
} from "@/features/records/state-slice";
import { iconForField, prettifyData } from "@/features/fields";
import { isEmpty } from "lodash";
import { parseColumns } from "..";
import { useAppDispatch, useAppSelector, useResponsive } from "@/hooks";
import {
  useColumns,
  useFilters,
  useOrderRecords,
  usePagination,
  useRecords,
  useResizableColumns,
  useSelectRecords,
} from "@/features/records/hooks";
import { useGetColumnsQuery } from "../api-slice"
import { useGetDataSourceQuery } from "@/features/data-sources/api-slice"
import { useGetRecordsQuery } from "@/features/records/api-slice";
import { useRouter } from "next/router";
import Cell from "./Cell";
import CheckboxColumnCell from "./CheckboxColumnCell";
import CursorPagination from "./CursorPagination"
import LoadingOverlay from "@/components/LoadingOverlay";
import MobileRow from "./MobileRow";
import OffsetPagination from "./OffsetPagination"
import React, { memo, useEffect, useMemo } from "react";
import RecordRow from "./RecordRow";
import SelectorColumnCell from "./SelectorColumnCell";
import classNames from "classnames";

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
    width: 50,
    minWidth: 50,
    maxWidth: 50,
  };

  const controlsColumn = {
    Header: "controls_column",
    accessor: (row: any, i: number) => `controls_column_${i}`,
    // eslint-disable-next-line react/display-name
    Cell: (row: any) => <SelectorColumnCell row={row.row} />,
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
        "table-widget relative divide-y bg-blue-gray-200 divide-blue-gray-200 overflow-auto w-full md:w-auto"
      }
      {...getTableProps()}
    >
      {isMd && (
        <div className="bg-blue-gray-200 rounded-t">
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
                        <IconElement className="h-3 inline-flex flex-shrink-0 mr-2" />
                        <span className="inline-block leading-none">
                          <>
                            {column.render("Header")}
                            {column?.meta && column.meta.name === orderBy && (
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
                      className={classNames(
                        "resizer group-hover:opacity-100 opacity-10",
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
            row={row}
            dataSourceId={dataSourceId}
            tableName={tableName}
          />
        );

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
  );
});

// const usePagination = ({ perPage }: { perPage: number }) => {
//   const router = useRouter();

//   const [page, setPage] = useState<number>(
//     router.query.page ? parseInt(router.query.page as string, 10) : 1
//   );

//   const [limit, offset] = useMemo(() => {
//     const limit: number = perPage;
//     const offset = page === 1 ? 0 : (page - 1) * limit;

//     return [perPage, offset];
//   }, [page]);

//   const nextPage = () => {
//     const nextPageNumber = page + 1;

//     router.push({
//       pathname: router.pathname,
//       query: {
//         ...router.query,
//         page: nextPageNumber,
//       },
//     });
//     setPage(nextPageNumber);
//   };

//   const previousPage = () => {
//     let nextPageNumber = page - 1;
//     if (nextPageNumber <= 0) nextPageNumber = 1;

//     router.push({
//       pathname: router.pathname,
//       query: {
//         ...router.query,
//         page: nextPageNumber,
//       },
//     });
//     setPage(nextPageNumber);
//   };

//   return { page, limit, offset, nextPage, previousPage, setPage };
// };

const RecordsTable = ({
  dataSourceId,
  tableName,
}: {
  dataSourceId?: string;
  tableName?: string;
}) => {
  // const router = useRouter();
  // @todo: Get filters from the URL param
  // const { encodedFilters } = useFilters();
  // @todo: per page selector
  // const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  // const { page, limit, offset, nextPage, previousPage, setPage } =
  //   usePagination({
  //     perPage,
  //   });

  // const {
  //   data: recordsResponse,
  //   error,
  //   isFetching,
  // } = useGetRecordsQuery({
  //   dataSourceId,
  //   tableName,
  //   filters: encodedFilters,
  //   limit: limit.toString(),
  //   offset: offset.toString(),
  //   orderBy: orderBy ? orderBy : "",
  //   orderDirection: orderDirection ? orderDirection : "",
  // });

  // const meta = useMemo(() => recordsResponse?.meta, [recordsResponse?.meta]);
  // const data = useMemo(
  //   () => (recordsResponse?.data ? prettifyData(recordsResponse?.data) : []),
  //   [recordsResponse?.data]
  // );

  // const maxPages = useMemo(() => {
  //   if (meta?.count) {
  //     return Math.ceil(meta?.count / perPage);
  //   }

  //   return 1;
  // }, [meta?.count]);

  // const canPreviousPage = useMemo(() => page > 1, [page]);
  // const canNextPage = useMemo(() => page < maxPages, [page, maxPages]);

  // const defaultColumn = {
  //   Cell,
  // };

  // const {
  //   getTableProps,
  //   getTableBodyProps,
  //   headerGroups,
  //   prepareRow,
  //   rows,
  //   state,
  // } = useTable(
  //   {
  //     columns,
  //     data,
  //     defaultColumn,
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
  //         dataSourceId,
  //         tableName,
  //       });
  //       window.localStorage.setItem(
  //         localStorageKey,
  //         (width as number).toString()
  //       );
  //     }
  //   );
  // }, [state]);

  // const [isValid, setIsValid] = useState(true);
  // const [hasColumns, setHasColumns] = useState(true);
  // const [tableIsVisible, setTableIsVisible] = useState(true);

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

  // const { isMd } = useResponsive();

  // const RowComponent = useMemo(() => (isMd ? RecordRow : MobileRow), [isMd]);

  // const { selectedRecords, setRecordsSelected, resetRecordsSelection } =
  //   useSelectRecords();

  // const allChecked = data.length === selectedRecords.length && data.length > 0;
  // const isIndeterminate = selectedRecords.length > 0 && !allChecked;

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

  // // Reset page to 1 when modifying filters.
  // useEffect(() => {
  //   setPage(1);
  // }, [encodedFilters]);



  // ----



  const router = useRouter();
  const dispatch = useAppDispatch();
  // @todo: Get filters from the URL param
  const { encodedFilters, removeFilter } = useFilters();
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
    orderBy: orderBy,
    orderDirection: orderDirection,
    // startingAfter: router.query.startingAfter as string,
    // endingBefore: router.query.endingBefore as string,
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

export default memo(RecordsTable);

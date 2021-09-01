import { Column as BaseToolColumn } from "@/features/fields/types";
import { Button } from "@chakra-ui/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SortAscendingIcon,
  SortDescendingIcon,
} from "@heroicons/react/outline";
import {
  Column,
  Row,
  SortingRule,
  useBlockLayout,
  useColumnOrder,
  useResizeColumns,
  useTable,
} from "react-table";
import { Filter } from "@/components/FilterCondition";
import { Views } from "@/features/fields/enums";
import { getField } from "@/features/fields/factory";
import { iconForField, prettifyData } from "@/features/fields";
import { isUndefined } from "lodash";
import { makeField } from "@/features/fields";
import {
  useGetRecordsQuery,
  usePrefetch,
} from "@/features/records/records-api-slice";
import { useRouter } from "next/router";
import Link from "next/link";
import React, { memo, useMemo, useState } from "react";
import classNames from "classnames";

const Cell = ({
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
    column: column.meta,
    tableName,
  });
  const Element = getField(column.meta, Views.index);

  return <Element field={field} />;
};

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

  return { page , limit, offset, nextPage, previousPage };
};

const RecordsTable = ({
  dataSourceId,
  columns,
  filters,
  tableName,
  orderBy,
  orderDirection,
  setOrderBy,
  setOrderDirection,
}: {
  dataSourceId: string;
  columns: Column[];
  filters: Filter;
  tableName: string;
  orderBy: string;
  setOrderBy: (by: string) => void;
  orderDirection: "" | "asc" | "desc";
  setOrderDirection: (direction: "" | "asc" | "desc") => void;
}) => {
  const router = useRouter()
  const encodedFilters = useMemo(
    () => (filters ? btoa("filters") : ""),
    [filters]
  );
  // @todo: per page selector
  const [perPage, setPerPage] = useState(24)
  const { page, limit, offset, nextPage, previousPage } =
    usePagination({
      perPage,
    });

  const {
    data: recordsResponse,
    error,
    isLoading,
  } = useGetRecordsQuery({
    dataSourceId,
    tableName,
    filters: encodedFilters,
    limit: limit.toString(),
    offset: offset.toString(),
    orderBy: orderBy,
    orderDirection: orderDirection,
  });

  const meta = useMemo(() => recordsResponse?.meta, [recordsResponse?.meta]);
  const data = useMemo(
    () => (recordsResponse?.data ? prettifyData(recordsResponse?.data) : []),
    [recordsResponse?.data]
  );

  const maxPages = useMemo(() => {
    if (meta?.count) {
      return Math.ceil(meta?.count / perPage);
    }

    return 1;
  }, [meta?.count]);

  const canPreviousPage = useMemo(() => page > 1, [page]);
  const canNextPage = useMemo(() => page < maxPages, [page, maxPages]);

  const defaultColumn = {
    Cell,
  };
  const initialState = useMemo(() => {
    let orderBy: SortingRule<string>[] = [];

    orderBy = [
      // {
      //   id: "id",
      //   desc: true,
      // },
    ];

    return {
      pageIndex: 0,
      pageSize: 10,
      orderBy,
    };
  }, []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
    state,
  } = useTable(
    {
      initialState,
      columns,
      data,
      defaultColumn,
    },
    useColumnOrder,
    useBlockLayout,
    useResizeColumns
  );

  const { pageIndex, pageSize, columnResizing } = useMemo(
    () => ({
      pageIndex: state.pageIndex,
      pageSize: state.pageSize,
      columnResizing: state.columnResizing,
    }),
    [state]
  );
  const [isValid, setIsValid] = useState(true);
  const [hasColumns, setHasColumns] = useState(true);
  const [tableIsVisible, setTableIsVisible] = useState(true);
  const prefetchRecord = usePrefetch("getRecord");

  const handleOrder = (columnName: string) => {
    let newOrderDirection: '' | 'asc' | 'desc' = ''
    let newOrderBy = ''

    if (orderBy !== columnName) {
      newOrderDirection = "asc";
      newOrderBy = columnName
    } else {
      switch (orderDirection) {
        default:
        case "":
          newOrderDirection = "asc";
          newOrderBy = columnName
          break;
        case "asc":
          newOrderDirection = "desc";
          newOrderBy = columnName
          break;
        case "desc":
          newOrderDirection = "";
          newOrderBy = ""
          break;
      }
    }

    setOrderDirection(newOrderDirection);
    setOrderBy(newOrderBy);

    const query = {...router.query}
    if (newOrderBy) {
      query.orderBy = newOrderBy
    } else {
      delete query.orderBy
    }
    if (newOrderDirection) {
      query.orderDirection = newOrderDirection
    } else {
      delete query.orderDirection
    }

    router.push({
      pathname: router.pathname,
      query,
    });
  };

  return (
    <div className="relative flex flex-col justify-between overflow-auto h-full">
      {/* <pre>{JSON.stringify([orderBy, orderDirection], null, 2)}</pre> */}
      {/* <pre>{JSON.stringify({
        page
      }, null, 2)}</pre> */}
      {isLoading && <div>loading...</div>}
      {error && <div>Error: {JSON.stringify(error)}</div>}
      {!isLoading && !isValid && (
        <div className="flex flex-1 justify-center items-center text-lg font-semibold text-gray-600">
          No rows found
        </div>
      )}

      {!hasColumns && isValid && (
        <div className="flex flex-1 justify-center items-center text-lg font-semibold text-gray-600">
          All columns are hidden
        </div>
      )}
      {tableIsVisible && (
        <div className="flex-1 flex">
          <div
            className={
              "table-widget relative block min-w-full divide-y divide-gray-200 overflow-auto"
            }
            {...getTableProps()}
          >
            <div className="bg-gray-50 rounded-t">
              {headerGroups.map((headerGroup) => (
                <div {...headerGroup.getHeaderGroupProps()} className="tr">
                  {headerGroup.headers.map((column: any) => {
                    const IconElement = iconForField(column.meta);

                    return (
                      <div
                        {...column.getHeaderProps()}
                        className="relative th px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {/* <pre>{JSON.stringify(column.getOrderByToggleProps(), null, 2)}</pre> */}
                        <div
                          // {...column.getOrderByToggleProps()}
                          className="header-content overflow-hidden whitespace-nowrap cursor-pointer"
                          onClick={() => handleOrder(column.meta.name)}
                        >
                          <IconElement className="h-3 inline-block mr-2" />
                          <span className="h-4 inline-block">
                            {column.render("Header")}
                            {column.meta.name === orderBy && (
                              <>
                                {orderDirection === "desc" && (
                                  <SortDescendingIcon className="h-4 inline" />
                                )}
                                {orderDirection === "asc" && (
                                  <SortAscendingIcon className="h-4 inline" />
                                )}
                                {/* {orderDirection === '' && '2'} */}
                              </>
                            )}
                          </span>
                        </div>
                        <div
                          {...column.getResizerProps()}
                          className={classNames("resizer", {
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

            <div {...getTableBodyProps()}>
              {rows.map((row: Row<any>, i) => {
                prepareRow(row);

                const hasId = !isUndefined(row?.original?.id);
                const link = `/data-sources/${dataSourceId}/tables/${tableName}/${row.original.id}`;

                const rowContent = (
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
                    className={classNames("tr hover:bg-gray-100", {
                      "bg-white": i % 2 === 0,
                      "bg-gray-50": i % 2 !== 0,
                      "cursor-pointer": hasId,
                    })}
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

                if (hasId) {
                  return (
                    <Link href={link} key={i}>
                      {rowContent}
                    </Link>
                  );
                }

                return rowContent;
              })}
            </div>
          </div>
        </div>
      )}
      <nav
        className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-sm"
        aria-label="Pagination"
      >
        <div className="inline-block text-gray-500 text-sm">
          {/* @todo: show a pretty numebr (2.7K in total) */}
          Showing {offset + 1}-{perPage * page} of{" "}
          {meta?.count ? `${meta.count} in total` : ""}
        </div>
        <div className="flex justify-between sm:justify-end">
          <Button
            size="sm"
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
          >
            <ChevronLeftIcon className="h-4 text-gray-600" />
          </Button>
          {/* @todo: show a pretty numebr (2.7K pages) */}
          <div className="flex items-center px-2 space-x-1">
            {page}
            <span className="pl-1">of {maxPages}</span>
          </div>
          <Button size="sm" onClick={() => nextPage()} disabled={!canNextPage}>
            <ChevronRightIcon className="h-4 text-gray-600" />
          </Button>
        </div>
        <div>
          {/* {dataQuery && (
            <Tooltip label="Reload query" aria-label="Reload query">
              <Button size="sm" onClick={() => reloadQuery()}>
                <RefreshIcon className="h-4" />
              </Button>
            </Tooltip> */}
          {/* ) */}
          {/* } */}
        </div>
      </nav>
    </div>
  );
};

export default memo(RecordsTable);

import { Column as BaseToolColumn } from "@/features/fields/types";
import { Button, Checkbox } from "@chakra-ui/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SortAscendingIcon,
  SortDescendingIcon,
} from "@heroicons/react/outline";
import {
  Column,
  Row,
  useBlockLayout,
  useColumnOrder,
  useResizeColumns,
  useTable,
} from "react-table";
import { OrderDirection } from "../types";
import { Views } from "@/features/fields/enums";
import { getField } from "@/features/fields/factory";
import { iconForField, prettifyData } from "@/features/fields";
import { isEmpty } from "lodash";
import { localStorageColumnWidthKey } from "..";
import { makeField } from "@/features/fields";
import { useFilters, useResponsive, useSelectRecords } from "@/hooks";
import { useGetRecordsQuery } from "@/features/records/api-slice";
import { useRouter } from "next/router";
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

const RecordsTable = ({
  dataSourceId,
  columns,
  tableName,
  orderBy,
  orderDirection,
  setOrderBy,
  setOrderDirection,
}: {
  dataSourceId: string;
  columns: Column[];
  tableName: string;
  orderBy: string;
  setOrderBy: (by: string) => void;
  orderDirection: OrderDirection;
  setOrderDirection: (direction: OrderDirection) => void;
}) => {
  const router = useRouter();
  // @todo: Get filters from the URL param
  const { encodedFilters } = useFilters();
  // @todo: per page selector
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const { page, limit, offset, nextPage, previousPage, setPage } = usePagination({
    perPage,
  });

  const {
    data: recordsResponse,
    error,
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

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
    state,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
    },
    useColumnOrder,
    useBlockLayout,
    useResizeColumns
  );

  useEffect(() => {
    // Keep the column sizes in localStorage
    Object.entries(state.columnResizing.columnWidths).forEach(
      ([columnName, width]: [string, unknown]) => {
        const localStorageKey = localStorageColumnWidthKey({
          dataSourceId,
          tableName,
          columnName,
        });
        window.localStorage.setItem(
          localStorageKey,
          (width as number).toString()
        );
      }
    );
  }, [state]);

  const [isValid, setIsValid] = useState(true);
  const [hasColumns, setHasColumns] = useState(true);
  const [tableIsVisible, setTableIsVisible] = useState(true);

  const handleOrder = (columnName: string) => {
    let newOrderDirection: OrderDirection = "";
    let newOrderBy = "";

    if (orderBy !== columnName) {
      newOrderDirection = "asc";
      newOrderBy = columnName;
    } else {
      switch (orderDirection) {
        default:
        case "":
          newOrderDirection = "asc";
          newOrderBy = columnName;
          break;
        case "asc":
          newOrderDirection = "desc";
          newOrderBy = columnName;
          break;
        case "desc":
          newOrderDirection = "";
          newOrderBy = "";
          break;
      }
    }

    setOrderDirection(newOrderDirection);
    setOrderBy(newOrderBy);

    const query = { ...router.query };
    if (newOrderBy) {
      query.orderBy = newOrderBy;
    } else {
      delete query.orderBy;
    }
    if (newOrderDirection) {
      query.orderDirection = newOrderDirection;
    } else {
      delete query.orderDirection;
    }

    router.push({
      pathname: router.pathname,
      query,
    });
  };

  const { isMd } = useResponsive();

  const RowComponent = useMemo(() => (isMd ? RecordRow : MobileRow), [isMd]);

  const { selectedRecords, setRecordsSelected, resetRecordsSelection } =
    useSelectRecords();

  const allChecked = data.length === selectedRecords.length && data.length > 0;
  const isIndeterminate = selectedRecords.length > 0 && !allChecked;

  const setCheckedItems = (checked: boolean) => {
    if (checked) {
      const ids = data.map((record) => record?.id);
      setRecordsSelected(ids);
    } else {
      resetRecordsSelection();
    }
  };

  useEffect(() => {
    resetRecordsSelection();
  }, [data]);

  // Reset page to 1 when modifying filters.
  useEffect(() => {
    setPage(1);
  }, [encodedFilters])

  return (
    <div className="relative flex flex-col justify-between h-full w-full">
      {isFetching && (
        <LoadingOverlay transparent={isEmpty(recordsResponse?.data)} />
      )}
      {error && <div>Error: {JSON.stringify(error)}</div>}
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
      {tableIsVisible && (
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
                    const isControlsColumn =
                      column.Header === "controls_column";

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
                              isChecked={allChecked}
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
                            "resizer group-hover:block hidden",
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
            const component = (
              <RowComponent
                key={index}
                row={row}
                dataSourceId={dataSourceId}
                tableName={tableName}
                prepareRow={prepareRow}
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
      )}
      <nav
        className="bg-white px-4 py-3 flex items-center justify-evenly border-t border-gray-200 sm:px-6 rounded-b"
        aria-label="Pagination"
      >
        <div className="flex-1 flex justify-start">
          <div className="inline-block text-gray-500 text-sm">
            {/* @todo: show a pretty numebr (2.7K in total) */}
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

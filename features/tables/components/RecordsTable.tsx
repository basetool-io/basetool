import { Column as BaseToolColumn } from '@/components/fields/types'
import { Button } from '@chakra-ui/react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SortAscendingIcon,
  SortDescendingIcon,
} from '@heroicons/react/outline'
import {
  Column,
  Row,
  SortingRule,
  useBlockLayout,
  useColumnOrder,
  usePagination,
  useResizeColumns,
  useSortBy,
  useTable,
} from 'react-table'
import { Views } from '@/components/fields/enums'
import { getField } from '@/components/fields/factory'
import { iconForField } from '@/components/fields/utils'
import { isUndefined } from 'lodash'
import {
  makeField,
} from '@/components/fields'
import { prettifyData } from '@/src/widgets/Table/components/Widget'
import {
  usePrefetch,
} from '@/features/records/records-api-slice'
import Link from 'next/link'
import React, { memo, useMemo, useState } from 'react'
import classNames from 'classnames'

const Cell = ({
  row,
  column,
  tableName,
}: {
  row: Row;
  column: { meta: BaseToolColumn };
  tableName: string,
}) => {
  const field = makeField({ record: row.original, column: column.meta, tableName })
  const Element = getField(column.meta, Views.index)

  return <Element field={field} />
}

const RecordsTable = ({
  dataSourceId,
  columns,
  data,
  tableName,
}: {
  dataSourceId: string;
  columns: Column[];
  data: [];
  tableName: string;
}) => {
  const prettyData = useMemo(() => prettifyData(data), [data])

  const defaultColumn = {
    Cell,
  }
  const initialState = useMemo(() => {
    let sortBy: SortingRule<string>[] = []

    sortBy = [
      {
        id: 'id',
        desc: true,
      },
    ]

    return {
      pageIndex: 0,
      pageSize: 12,
      sortBy,
    }
  }, [])

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page, // Instead of using 'rows', we'll use page,
    // which has only the rows for the active page

    // The rest of these things are super handy, too ;)
    canPreviousPage,
    canNextPage,
    pageOptions,
    gotoPage,
    nextPage,
    previousPage,
    state,
    setHiddenColumns,
  } = useTable(
    {
      initialState,
      columns,
      data: prettyData,
      defaultColumn,
    },
    useColumnOrder,
    useBlockLayout,
    useResizeColumns,
    useSortBy,
    usePagination,
  )

  const { pageIndex, pageSize, columnResizing } = useMemo(
    () => ({
      pageIndex: state.pageIndex,
      pageSize: state.pageSize,
      columnResizing: state.columnResizing,
    }),
    [state],
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isValid, setIsValid] = useState(true)
  const [hasColumns, setHasColumns] = useState(true)
  const [tableIsVisible, setTableIsVisible] = useState(true)
  const prefetchRecord = usePrefetch('getRecord')

  return (
    <div className="relative flex flex-col justify-between overflow-auto h-full">
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
              'table-widget relative block min-w-full divide-y divide-gray-200 overflow-auto'
            }
            {...getTableProps()}
          >
            <div className="bg-gray-50 rounded-t">
              {headerGroups.map((headerGroup) => (
                <div {...headerGroup.getHeaderGroupProps()} className="tr">
                  {headerGroup.headers.map((column: any) => {
                    const IconElement = iconForField(column.meta)

                    return (
                      <div
                        {...column.getHeaderProps()}
                        className="relative th px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        <div
                          {...column.getSortByToggleProps()}
                          className="header-content overflow-hidden whitespace-nowrap"
                        >
                          <IconElement className="h-3 inline-block mr-2" />
                          <span className="h-4 inline-block">
                            {column.render('Header')}
                            {column.isSorted ? (
                              <>
                                {column.isSortedDesc ? (
                                  <SortDescendingIcon className="h-4 inline" />
                                ) : (
                                  <SortAscendingIcon className="h-4 inline" />
                                )}
                              </>
                            ) : (
                              ''
                            )}
                          </span>
                        </div>
                        <div
                          {...column.getResizerProps()}
                          className={classNames('resizer', { isResizing: column.isResizing })}
                        >
                          <div className="resizer-bar" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            <div {...getTableBodyProps()}>
              {page.map((row: Row<any>, i) => {
                prepareRow(row)

                const hasId = !isUndefined(row?.original?.id)
                const link = `/new/data-sources/${dataSourceId}/tables/${tableName}/${row.original.id}`

                const rowContent = (
                  <div
                    {...row.getRowProps()}
                    onMouseOver={() => prefetchRecord({
                      dataSourceId,
                      tableName,
                      recordId: row.original.id.toString(),
                    })
                    }
                    className={classNames('tr hover:bg-gray-100', {
                      'bg-white': i % 2 === 0,
                      'bg-gray-50': i % 2 !== 0,
                      'cursor-pointer': hasId,
                    })}
                  >
                    {row.cells.map((cell) => (
                      <div
                        {...cell.getCellProps()}
                        className="td px-6 py-2 whitespace-nowrap text-sm text-gray-500 truncate"
                      >
                        {cell.render('Cell')}
                      </div>
                    ))}
                  </div>
                )

                if (hasId) {
                  return (
                    <Link href={link} key={i}>
                      {rowContent}
                    </Link>
                  )
                }

                return rowContent
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
          {data?.length ? `${data?.length} results` : ''}
        </div>
        <div className="flex justify-between sm:justify-end">
          <Button
            size="sm"
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
          >
            <ChevronLeftIcon className="h-4 text-gray-600" />
          </Button>
          <div className="flex items-center px-2 space-x-1">
            {pageIndex + 1}
            <span className="pl-1">of {pageOptions.length}</span>
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
  )
}

export default memo(RecordsTable)

import { Button } from "@chakra-ui/button";
import { Column } from "@/features/fields/types";
import { FooterElements } from "@/types";
import { ItemTypes } from "@/lib/ItemTypes";
import { SelectorIcon } from "@heroicons/react/outline";
import { diff as difference } from "deep-object-diff";
import { getColumnNameLabel, iconForField } from "@/features/fields";
import { isEmpty } from "lodash";
import { useBoolean } from "react-use";
import { useDrop } from "react-dnd";
import {
  useGetColumnsQuery,
  useGetTablesQuery,
  useUpdateTableMutation,
} from "@/features/tables/api-slice";
import { useGetDataSourceQuery } from "@/features/data-sources/api-slice";
import { useRouter } from "next/router";
import { useSegment } from "@/hooks";
import ColumnListItem from "@/components/ColumnListItem";
import DataSourcesEditLayout from "@/features/data-sources/components/DataSourcesEditLayout";
import React, { ReactElement, useEffect, useMemo, useState } from "react";
import update from "immutability-helper";

const TableColumnsEditLayout = ({
  dataSourceId,
  backLink,
  crumbs,
  isLoading = false,
  footerElements,
  children,
}: {
  dataSourceId?: string;
  backLink?: string;
  crumbs?: string[];
  isLoading?: boolean;
  footerElements?: FooterElements;
  children?: ReactElement;
}) => {
  const router = useRouter();
  dataSourceId ||= router.query.dataSourceId as string;
  const tableName = router.query.tableName as string;

  const { data: dataSourceResponse } = useGetDataSourceQuery(
    { dataSourceId },
    {
      skip: !dataSourceId,
    }
  );

  const { data: columnsResponse } = useGetColumnsQuery(
    {
      dataSourceId,
      tableName,
    },
    { skip: !dataSourceId || !tableName }
  );

  const { data: tablesResponse } = useGetTablesQuery(
    {
      dataSourceId,
    },
    { skip: !dataSourceId }
  );

  const track = useSegment("Visited edit columns page", {
    page: "edit columns",
  });

  const [reordering, setReordering] = useBoolean(false);

  const [columns, setColumns] = useState<Column[]>([]);

  useEffect(() => {
    if (columnsResponse?.ok) setColumns(sortColumns(columnsResponse.data));
  }, [columnsResponse]);

  const sortColumns = (columns: Column[]) => {
    const newColumns: Column[] = [];
    if (!isEmpty(columns))
      columns.forEach((column: Column, index: number) => {
        newColumns.push({
          ...column,
          baseOptions: { ...column.baseOptions, orderIndex: index },
        });
      });

    return newColumns;
  };

  const findColumn = (id: number) => {
    const column = columns.filter(
      (c: Column) => c.baseOptions.orderIndex === id
    )[0];

    return {
      column,
      index: columns.indexOf(column),
    };
  };

  const moveColumn = (id: number, atIndex: number) => {
    const { column, index } = findColumn(id);
    setColumns(
      update(columns, {
        $splice: [
          [index, 1],
          [atIndex, 0, column],
        ],
      })
    );
  };

  const [, drop] = useDrop(() => ({ accept: ItemTypes.COLUMN }));

  const [updateTable, { isLoading: isUpdating }] = useUpdateTableMutation();

  const setReorderingValues = async () => {
    if (reordering) {
      updateColumnOrder();
      setReordering(false);
    } else {
      setReordering(true);
    }
  };

  const updateColumnOrder = async () => {
    if (tablesResponse?.ok && isDirty) {
      const table = tablesResponse.data.filter(
        (table: any) => table.name === router.query.tableName
      )[0];

      const newColumns = { ...table.columns };
      Object.entries(newColumns).forEach(
        ([columnName, column]: [string, any]) => {
          const localColumn = columns.filter(
            (c: Column) => c.name === columnName
          )[0];
          newColumns[columnName] = {
            ...column,
            baseOptions: {
              ...column.baseOptions,
              orderIndex: columns.indexOf(localColumn),
            },
          };
        }
      );

      await updateTable({
        dataSourceId: router.query.dataSourceId as string,
        tableName: router.query.tableName as string,
        body: { columns: newColumns },
      }).unwrap();
    }
  };

  const diff = useMemo(() => {
    const initialColumns = sortColumns(columnsResponse?.data);

    return difference(initialColumns, columns);
  }, [columns, columnsResponse]);

  const isDirty = useMemo(() => !isEmpty(diff), [diff]);

  return (
    <DataSourcesEditLayout
      backLink={`/data-sources/${router.query.dataSourceId}/tables/${router.query.tableName}`}
      backLabel="Back to table"
      crumbs={
        crumbs || [dataSourceResponse?.data.name, "Edit", tableName, "Columns"]
      }
      isLoading={isLoading}
      footerElements={footerElements}
    >
      <>
        <div className="relative flex-1 max-w-full w-full flex">
          <div className="flex flex-shrink-0 w-1/4 border-r">
            <div className="w-full relative p-4">
              <div className="flex justify-between">
                <div className="mb-2 font-semibold text-gray-500">Fields</div>
                <Button
                  colorScheme="blue"
                  size="xs"
                  variant="outline"
                  onClick={setReorderingValues}
                  isLoading={isUpdating}
                  leftIcon={<SelectorIcon className="h-4" />}
                >
                  {reordering && isDirty ? 'Save' : 'Re-order'}
                </Button>
              </div>
              <div ref={drop}>
                {!isEmpty(columns) &&
                  columns.map((col: any) => {
                    const IconElement = iconForField(col);

                    return (
                      <ColumnListItem
                        key={col.name}
                        icon={
                          <IconElement className="h-4 mr-2 flex flex-shrink-0" />
                        }
                        href={`/data-sources/${dataSourceId}/edit/tables/${tableName}/columns/${col.name}`}
                        active={col.name === router.query.columnName}
                        onClick={() => track("Selected column in edit columns")}
                        reordering={reordering}
                        id={col.baseOptions.orderIndex}
                        moveColumn={moveColumn}
                        findColumn={findColumn}
                      >
                        {getColumnNameLabel(
                          col.baseOptions.label,
                          col.label,
                          col.name
                        )}{" "}
                        {col.baseOptions.required && (
                          <sup className="text-red-600">*</sup>
                        )}
                      </ColumnListItem>
                    );
                  })}
              </div>
            </div>
          </div>
          <div className="flex-1 p-4">
            {children && children}
            {!children && (
              <div className="flex-1 p-4">
                👈 Select a column to start editing
              </div>
            )}
          </div>
        </div>
      </>
    </DataSourcesEditLayout>
  );
};

export default TableColumnsEditLayout;

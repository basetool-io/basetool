import { Button } from "@chakra-ui/button";
import { Column } from "@/features/fields/types";
import { FooterElements } from "@/types";
import { INITIAL_NEW_COLUMN } from "@/pages/data-sources/[dataSourceId]/edit/tables/[tableName]/columns/[columnName]";
import { ItemTypes } from "@/lib/ItemTypes";
import { PlusIcon, SelectorIcon } from "@heroicons/react/outline";
import { getColumnNameLabel, iconForField } from "@/features/fields";
import { isEmpty } from "lodash";
import { useBoolean } from "react-use";
import { useDataSourceContext, useSegment } from "@/hooks";
import { useDrop } from "react-dnd";
import {
  useGetColumnsQuery,
  useGetTablesQuery,
  useUpdateColumnsOrderMutation,
} from "@/features/tables/api-slice";
import { useGetDataSourceQuery } from "@/features/data-sources/api-slice";
import { useRouter } from "next/router";
import ColumnListItem from "@/components/ColumnListItem";
import DataSourcesEditLayout from "@/features/data-sources/components/DataSourcesEditLayout";
import React, { ReactElement, useEffect, useState } from "react";
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
  const { dataSourceId: appRouterDataSourceId, tableName } = useDataSourceContext();
  dataSourceId ||= appRouterDataSourceId;

  const columnName = router.query.columnName as string;

  const { data: dataSourceResponse } = useGetDataSourceQuery(
    { dataSourceId },
    {
      skip: !dataSourceId,
    }
  );

  const { data: columnsResponse } = useGetColumnsQuery(
    {
      dataSourceId,
      tableName: tableName,
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
  const [{ didDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.COLUMN,
    collect: (monitor) => ({
      didDrop: monitor.getItemType() === ItemTypes.COLUMN ? monitor.didDrop() : false,
    }),
  }));
  const [updateOrder, { isLoading: isUpdating }] = useUpdateColumnsOrderMutation();

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

  const updateColumnsOrder = async () => {
    if (tablesResponse?.ok) {
      const table = tablesResponse.data.find(
        (table: any) => table.name === tableName
      );

      const tableColumns = { ...table.columns };
      columns.forEach((column: Column, index: number) => {
        tableColumns[column.name] = {
          baseOptions: {
            orderIndex: index,
          },
        };
      });

      await updateOrder({
        dataSourceId: dataSourceId,
        tableName: tableName,
        body: { columns: tableColumns },
      }).unwrap();
    }
  };

  // Everytime columns gets updated, we have to sort the indices retrieved from the server and set indices from 0 to length - 1 in order for dnd to work.
  useEffect(() => {
    if (columnsResponse?.ok) setColumns(sortColumns(columnsResponse.data));
  }, [columnsResponse]);

  // We have to save the order of the columns when the order changes, and the order changes when an element is dropped.
  useEffect(() => {
    if (didDrop === true) updateColumnsOrder();
  }, [didDrop]);

  return (
    <DataSourcesEditLayout
      backLink={`/data-sources/${dataSourceId}/tables/${tableName}`}
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
                  onClick={() => setReordering(!reordering)}
                  isLoading={isUpdating}
                  leftIcon={<SelectorIcon className="h-4" />}
                >
                  Re-order
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
                        active={col.name === columnName}
                        onClick={() => track("Selected column in edit columns")}
                        itemType={ItemTypes.COLUMN}
                        reordering={reordering}
                        id={col.baseOptions.orderIndex}
                        moveMethod={moveColumn}
                        findMethod={findColumn}
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
              <div className="mt-2">
                <ColumnListItem
                  icon={<PlusIcon className="h-4 mr-2 flex flex-shrink-0" />}
                  href={`/data-sources/${dataSourceId}/edit/tables/${tableName}/columns/${INITIAL_NEW_COLUMN.name}`}
                  active={INITIAL_NEW_COLUMN.name === columnName}
                  onClick={() => track("Add column in edit columns")}
                >
                  Add new field
                </ColumnListItem>
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

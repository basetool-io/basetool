import { Button } from "@chakra-ui/button";
import { ItemTypes } from "@/lib/ItemTypes";
import { ListTable } from "@/plugins/data-sources/abstract-sql-query-service/types";
import { SelectorIcon } from "@heroicons/react/outline";
import { getLabel } from "@/features/data-sources";
import { isEmpty } from "lodash";
import { useBoolean } from "react-use";
import { useDataSourceContext } from "@/hooks";
import { useDrop } from "react-dnd";
import { useGetDataSourceQuery } from "../api-slice";
import { useGetTablesQuery, useUpdateTablesMutation } from "@/features/tables/api-slice";
import ColumnListItem from "@/components/ColumnListItem";
import LoadingOverlay from "@/components/LoadingOverlay";
import React, { memo, useEffect, useState } from "react";
import update from "immutability-helper";

const DataSourceEditSidebar = ({ dataSourceId }: { dataSourceId?: string }) => {
  const { dataSourceId: appRouterDataSourceId, tableName } = useDataSourceContext();
  dataSourceId ||= appRouterDataSourceId;

  const { data: dataSourceResponse } = useGetDataSourceQuery(
    { dataSourceId },
    {
      skip: !dataSourceId,
    }
  );

  const { data: tablesResponse, isLoading } = useGetTablesQuery(
    {
      dataSourceId,
    },
    { skip: !dataSourceId }
  );

  const [reordering, setReordering] = useBoolean(false);
  const [tables, setTables] = useState<ListTable[]>([]);
  const [{ didDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.TABLE,
    collect: (monitor) => ({
      didDrop: monitor.getItemType() === ItemTypes.TABLE ? monitor.didDrop() : false,
    }),
  }));
  const [updateTables, { isLoading: isUpdating }] = useUpdateTablesMutation();

  const sortTables = (tables: ListTable[]) => {
    const newTables: ListTable[] = [];
    if (!isEmpty(tables))
      tables.forEach((table: ListTable, index: number) => {
        newTables.push({
          ...table,
          orderIndex: index,
        });
      });

    return newTables;
  };

  const findTable = (id: number) => {
    const table = tables.filter((t: ListTable) => t.orderIndex === id)[0];

    return {
      table,
      index: tables.indexOf(table),
    };
  };

  const moveTable = (id: number, atIndex: number) => {
    const { table, index } = findTable(id);
    setTables(
      update(tables, {
        $splice: [
          [index, 1],
          [atIndex, 0, table],
        ],
      })
    );
  };

  const updateTablesOrder = async () => {
    if (dataSourceResponse?.ok) {
      const dataSourceTables = {...dataSourceResponse?.data?.options.tables};

      tables.forEach((table: ListTable, index: number) => {
        const dataSourceTable = dataSourceTables[table.name];
        dataSourceTables[table.name] = {
          ...dataSourceTable,
            orderIndex: index,
        };
      });

      await updateTables({
        dataSourceId: dataSourceId,
        body: { tables: dataSourceTables },
      }).unwrap();
    }
  };

  useEffect(() => {
    if (tablesResponse?.ok) setTables(sortTables(tablesResponse.data));
  }, [tablesResponse]);

  useEffect(() => {
    if (didDrop === true) updateTablesOrder();
  }, [didDrop]);

  return (
    <div className="w-full relative p-4">
      <div className="flex justify-between">
        <div className="mb-2 font-semibold text-gray-500">Tables</div>
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
      {isLoading && (
        <div className="flex-1 min-h-full">
          <LoadingOverlay transparent={true} subTitle={false} />
        </div>
      )}
      <div ref={drop}>
        {!isEmpty(tables) &&
          tables.map((table: ListTable) => {
            return (
              <ColumnListItem
                key={table.name}
                active={table.name === tableName}
                href={`/data-sources/${dataSourceId}/edit/tables/${table.name}`}
                itemType={ItemTypes.TABLE}
                reordering={reordering}
                id={table?.orderIndex}
                moveMethod={moveTable}
                findMethod={findTable}
              >
                {getLabel(table)}
              </ColumnListItem>
            );
          })}
      </div>
    </div>
  );
};

export default memo(DataSourceEditSidebar);

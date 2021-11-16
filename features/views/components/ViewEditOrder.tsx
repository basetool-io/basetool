import { Button, Select, Tooltip } from "@chakra-ui/react";
import { DecoratedView, OrderParams } from "../types";
import { PlusCircleIcon, TrashIcon } from "@heroicons/react/outline";
import { Views } from "@/features/fields/enums";
import { getFilteredColumns } from "@/features/fields";
import { isEmpty } from "lodash";
import { useDataSourceContext, useSegment } from "@/hooks";
import { useGetColumnsQuery } from "@/features/fields/api-slice";
import React, { useMemo } from "react";
import TinyLabel from "@/components/TinyLabel";

const OrderDirections = [
  {
    value: "asc",
    label: "Ascending A→Z 1→9",
  },
  {
    value: "desc",
    label: "Descending Z→A 9→1",
  },
];

const ViewEditOrder = ({
  view,
  updateOrder,
}: {
  view: DecoratedView;
  updateOrder: (order: OrderParams[]) => void;
}) => {
  const track = useSegment();
  const { viewId } = useDataSourceContext();
  const { data: columnsResponse } = useGetColumnsQuery(
    {
      viewId,
    },
    {
      skip: !viewId,
    }
  );

  const columns = useMemo(
    () => getFilteredColumns(columnsResponse?.data, Views.index),
    [columnsResponse?.data]
  );

  const defaultOrder = useMemo(() => {
    if (isEmpty(columns)) return {};

    return {
      columnName: columns[0].name,
      direction: "desc",
    };
  }, [columns]);

  const handleUpdateOrder = (order: OrderParams[]) => {
    track('Updated order on edit view page', {
      direction: order[0]?.direction
    })

    updateOrder(order)
  }

  return (
    <div>
      <div className="relative flex w-full justify-between items-center">
        <TinyLabel>Default order</TinyLabel>
        <div>
          {isEmpty(view?.defaultOrder) && (
            <Tooltip label="Add order rule">
              <div
                className="flex justify-center items-center mx-1 text-xs cursor-pointer"
                onClick={() => handleUpdateOrder([defaultOrder])}
              >
                <PlusCircleIcon className="h-4 inline mr-px" /> Add
              </div>
            </Tooltip>
          )}
        </div>
      </div>
      <div className="mt-2">
        {isEmpty(view?.defaultOrder) && (
          <div className="text-sm text-gray-600">
            No default order applied to this view
          </div>
        )}
        {isEmpty(view?.defaultOrder) || (
          <div className="flex w-full space-x-2">
            <Select
              size="xs"
              className="font-mono"
              value={view?.defaultOrder[0]?.columnName}
              onChange={(e) =>
                handleUpdateOrder([
                  {
                    ...view.defaultOrder[0],
                    columnName: e.currentTarget.value,
                  },
                ])
              }
            >
              {columns &&
                columns.map((column, idx) => (
                  <option key={idx} value={column.name}>
                    {column.label}
                  </option>
                ))}
            </Select>
            <Select
              size="xs"
              className="font-mono"
              value={view?.defaultOrder[0]?.direction}
              onChange={(e) =>
                handleUpdateOrder([
                  {
                    ...view.defaultOrder[0],
                    direction: e.currentTarget.value,
                  },
                ])
              }
            >
              {OrderDirections.map((order, idx) => (
                <option key={idx} value={order.value}>
                  {order.label}
                </option>
              ))}
            </Select>
            <Tooltip label="Remove order rule">
              <Button size="xs" variant="link" onClick={() => handleUpdateOrder([])}>
                <TrashIcon className="h-3 text-gray-700" />
              </Button>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewEditOrder;

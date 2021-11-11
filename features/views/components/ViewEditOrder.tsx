import { Button, Select, Tooltip } from "@chakra-ui/react";
import { DecoratedView, OrderParams } from "../types";
import { OrderDirection } from "@/features/tables/types";
import { PlusCircleIcon, TrashIcon } from "@heroicons/react/outline";
import { Views } from "@/features/fields/enums";
import { getFilteredColumns } from "@/features/fields";
import { isEmpty } from "lodash";
import { useDataSourceContext, useSegment } from "@/hooks";
import { useGetColumnsQuery } from "@/features/fields/api-slice";
import { useOrderRecords } from "@/features/records/hooks";
import React, { useEffect, useMemo } from "react";
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
  const { setOrderBy, setOrderDirection } = useOrderRecords();
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
      direction: "asc",
    };
  }, [columns]);

  useEffect(() => {
    setOrderBy(view?.defaultOrder?.columnName || "");
    setOrderDirection((view?.defaultOrder?.direction as OrderDirection) || "");
  }, [view?.defaultOrder]);

  return (
    <div>
      <div className="relative flex w-full justify-between items-center">
        <TinyLabel>Default order</TinyLabel>
        <div>
          {isEmpty(view?.defaultOrder) && (
            <Tooltip label="Add order rule">
              <div
                className="flex justify-center items-center mx-1 text-xs cursor-pointer"
                onClick={() => updateOrder([defaultOrder])}
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
              value={view?.defaultOrder?.columnName}
              onChange={(e) =>
                updateOrder([{
                  ...view.defaultOrder[0],
                  columnName: e.currentTarget.value,
                }])
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
              value={view?.defaultOrder?.direction}
              onChange={(e) =>
                updateOrder([{
                  ...view.defaultOrder[0],
                  direction: e.currentTarget.value,
                }])
              }
            >
              {OrderDirections.map((order, idx) => (
                <option key={idx} value={order.value}>
                  {order.label}
                </option>
              ))}
            </Select>
            <Tooltip label="Remove order rule">
              <Button size="xs" variant="link" onClick={() => updateOrder([])}>
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

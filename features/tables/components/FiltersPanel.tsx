import { Button } from "@chakra-ui/react";
import { Column } from "@/features/fields/types";
import { IntFilterConditions } from "./IntConditionComponent";
import { PlusIcon, ReceiptRefundIcon } from "@heroicons/react/outline";
import { useFilters } from "@/hooks";
import FilterRow, { Filter } from "@/features/tables/components/FilterRow";
import React, { forwardRef } from "react";
import isEmpty from "lodash/isEmpty"

const FiltersPanel = ({ columns }: { columns: Column[] }, ref) => {
  const { filters, setFilters, applyFilters, allFiltersApplied } = useFilters();

  const addFilter = () => {
    const filter: Filter = {
      columnName: columns[0].name,
      columnLabel: columns[0].label,
      column: columns[0],
      condition: IntFilterConditions.is,
      value: "",
    };

    setFilters([...filters, filter]);
  };

  return (
    <div ref={ref} className="absolute border shadow-lg bg-white z-20 min-w-[40rem] min-h-[6rem] mt-8 p-4">
      <div className="relative  flex flex-col justify-between w-full min-h-full h-full space-y-4">
        <div className="space-y-4">
          {/* <pre>{JSON.stringify(filters, null, 2)}</pre> */}
          {/* <pre>{JSON.stringify(appliedFilters, null, 2)}</pre> */}
          {isEmpty(filters) && <div>
            No filters applied to this view
            <div className="text-sm text-gray-600">Add a filter below</div>
          </div>}
          {isEmpty(filters) ||
            filters.map((filter, idx) => (
              <FilterRow
                key={idx}
                idx={idx}
                columns={columns}
                filter={filter}
              />
            ))}
        </div>
        <hr/>
        <div className="flex justify-between">
          <Button
            size="sm"
            onClick={addFilter}
            leftIcon={<PlusIcon className="h-4" />}
          >
            Add filter
          </Button>
          <Button
            size="sm"
            colorScheme="blue"
            onClick={() => applyFilters(filters)}
            disabled={allFiltersApplied}
            leftIcon={<ReceiptRefundIcon className="h-4" />}
          >
            Apply filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default forwardRef(FiltersPanel);

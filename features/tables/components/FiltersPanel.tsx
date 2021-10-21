import { Button } from "@chakra-ui/react";
import { Column } from "@/features/fields/types";
import { FilterVerbs } from "./VerbComponent";
import {
  FolderAddIcon,
  PlusIcon,
  ReceiptRefundIcon,
} from "@heroicons/react/outline";
import { useFilters } from "@/hooks";
import Filter, {
  IFilter,
  IFilterGroup,
  getDefaultFilterCondition,
} from "@/features/tables/components/Filter";
import GroupFiltersPanel from "./GroupFiltersPanel";
import React, { forwardRef } from "react";
import isEmpty from "lodash/isEmpty";

const FiltersPanel = (
  {
    columns,
    fromViewEdit = false,
  }: {
    columns: Column[];
    fromViewEdit?: boolean;
  },
  ref: any
) => {
  const { filters, setFilters, applyFilters, allFiltersApplied } = useFilters();

  const addFilter = () => {
    const filter: IFilter = {
      columnName: columns[0].name,
      column: columns[0],
      condition: getDefaultFilterCondition(columns[0].fieldType),
      value: "",
      verb: filters.length > 1 ? filters[1].verb : FilterVerbs.and,
    };

    setFilters([...filters, filter]);
  };

  const addFilterGroup = () => {
    const filter: IFilterGroup = {
      isGroup: true,
      verb: filters.length > 1 ? filters[1].verb : FilterVerbs.and,
      filters: [
        {
          columnName: columns[0].name,
          column: columns[0],
          condition: getDefaultFilterCondition(columns[0].fieldType),
          value: "",
          verb: FilterVerbs.and,
        },
      ],
    };

    setFilters([...filters, filter]);
  };

  return (
    <div
      ref={ref}
      className={`absolute border rounded-md shadow-lg bg-white z-20 min-w-[31.2rem] min-h-[6rem] p-4 ${
        fromViewEdit ? "mt-2" : "mt-8"
      }`}
    >
      <div className="relative  flex flex-col justify-between w-full min-h-full h-full space-y-3">
        <div className="space-y-4">
          {isEmpty(filters) && (
            <div>
              No filters applied to this view
              <div className="text-sm text-gray-600">
                Add a filter from the button below
              </div>
            </div>
          )}
          {isEmpty(filters) ||
            filters.map((filter, idx) => {
              if ("isGroup" in filter && filter.isGroup) {
                return (
                  <div
                    className={
                      filter?.isBaseFilter
                        ? "opacity-60 pointer-events-none"
                        : ""
                    }
                  >
                    <GroupFiltersPanel
                      key={idx}
                      idx={idx}
                      columns={columns}
                      verb={(filter as IFilterGroup).verb}
                      filters={(filter as IFilterGroup).filters}
                    />
                  </div>
                );
              } else {
                return (
                  <div
                    className={
                      filter?.isBaseFilter
                        ? "opacity-60 pointer-events-none"
                        : ""
                    }
                  >
                    <Filter
                      key={idx}
                      idx={idx}
                      columns={columns}
                      filter={filter as IFilter}
                    />
                  </div>
                );
              }
            })}
        </div>
        <hr />
        <div className="flex justify-between">
          <div className="space-x-2">
            <Button
              size="xs"
              colorScheme="gray"
              onClick={addFilter}
              leftIcon={<PlusIcon className="h-3 text-gray-600" />}
            >
              Add a filter
            </Button>
            <Button
              size="xs"
              colorScheme="gray"
              onClick={addFilterGroup}
              leftIcon={<FolderAddIcon className="h-3 text-gray-600" />}
            >
              Add a filter group
            </Button>
          </div>
          <Button
            size="xs"
            colorScheme="blue"
            onClick={() => applyFilters(filters)}
            disabled={allFiltersApplied}
            leftIcon={<ReceiptRefundIcon className="h-3" />}
          >
            Apply filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default forwardRef(FiltersPanel);

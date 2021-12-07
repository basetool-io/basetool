import { Button } from "@chakra-ui/react";
import { Column } from "@/features/fields/types";
import { FilterVerbs, IntFilterConditions } from "..";
import { IFilter, IFilterGroup } from "../types";
import { PlusIcon } from "@heroicons/react/outline";
import { useFilters } from "@/features/records/hooks";
import Filter from "./Filter";
import FilterTrashIcon from "./FilterTrashIcon";
import React, { forwardRef, useMemo } from "react";
import VerbComponent from "./VerbComponent";

const GroupFiltersPanel = (
  {
    columns,
    verb,
    filters: groupFilters,
    idx: parentIdx,
  }: {
    columns: Column[];
    verb: FilterVerbs;
    filters: IFilter[];
    idx: number;
  },
  ref: any
) => {
  const { filters, removeFilter, updateFilter } = useFilters();

  const hasColumns = useMemo(() => columns && columns.length > 0, [columns]);

  const addFilter = () => {
    if (!hasColumns) return;

    const filter: IFilter = {
      columnName: columns[0].name,
      column: columns[0],
      condition: IntFilterConditions.is,
      value: "",
      verb: groupFilters.length > 1 ? groupFilters[1].verb : FilterVerbs.and,
    };

    const groupFilter = filters[parentIdx] as IFilterGroup;
    const newFilters = [...groupFilter.filters, filter];
    updateFilter(parentIdx, {
      ...groupFilter,
      filters: newFilters,
    });
  };

  const removeFilterGroup = () => {
    removeFilter(parentIdx);
  };

  const changeFilterGroupVerb = (verb: FilterVerbs) => {
    const groupFilter = filters[parentIdx];
    updateFilter(parentIdx, {
      ...groupFilter,
      verb,
    });
  };

  return (
    <div className="flex space-x-2">
      <div className="w-16">
        <VerbComponent
          idx={parentIdx}
          verb={verb}
          onChange={(value: FilterVerbs) => changeFilterGroupVerb(value)}
        />
      </div>
      <div
        ref={ref}
        className="flex flex-1 bg-white min-w-[20rem] min-h-[3rem] p-2 border"
      >
        <div className="relative flex flex-col justify-between w-full min-h-full h-full space-y-2">
          <div className="space-y-4">
            {groupFilters.map((filter, idx) => (
              <Filter
                key={idx}
                parentIdx={parentIdx}
                idx={idx}
                columns={columns}
                filter={filter as IFilter}
              />
            ))}
          </div>
          <hr />
          <div className="flex justify-between">
            <div className="space-x-2">
              {hasColumns && (
                <Button
                  size="xs"
                  colorScheme="gray"
                  onClick={addFilter}
                  leftIcon={<PlusIcon className="h-3 text-gray-600" />}
                >
                  Add a filter
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <FilterTrashIcon onClick={removeFilterGroup} />
    </div>
  );
};

export default forwardRef(GroupFiltersPanel);

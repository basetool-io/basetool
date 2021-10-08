import { Button, FormControl, Tooltip } from "@chakra-ui/react";
import { Column } from "@/features/fields/types";
import { IntFilterConditions } from "./IntConditionComponent";
import { PlusIcon, XIcon } from "@heroicons/react/outline";
import { useFilters } from "@/hooks";
import Filter, {
  FilterVerb,
  FilterVerbs,
  IFilter,
} from "@/features/tables/components/Filter";
import React, { forwardRef, useState } from "react";

const GroupFiltersPanel = (
  {
    columns,
    verb,
    filters: initialFilters,
    idx: parentIdx,
  }: { columns: Column[]; verb: FilterVerb; filters: IFilter[]; idx: number },
  ref: any
) => {
  // const { filters, setFilters, applyFilters, allFiltersApplied } = useFilters();
  const { removeFilter, updateFilter } = useFilters();

  const [filters, setFilters] = useState<IFilter[]>(initialFilters);

  const addFilter = () => {
    const filter: IFilter = {
      columnName: columns[0].name,
      columnLabel: columns[0].label,
      column: columns[0],
      condition: IntFilterConditions.is,
      value: "",
      verb: filters.length > 1 ? filters[1].verb : FilterVerbs.and,
    };

    setFilters([...filters, filter]);
  };

  const removeFilterGroup = () => {
    removeFilter(parentIdx);
  }

  return (
    <div className="flex">
      <div className="align-top pt-4">
        <Tooltip label="Remove filter group">
          <Button size="xs" variant="link" onClick={() => removeFilterGroup()}>
            <XIcon className="h-5 text-gray-700" />
          </Button>
        </Tooltip>
      </div>
      <FormControl id="verb" className="min-w-[75px] max-w-[75px] pt-4 mr-1">
        <div className="text-gray-800 text-right text-sm font-mono">{verb}</div>
      </FormControl>
      <div
        ref={ref}
        className="border flex flex-1 rounded-md bg-white z-20 min-w-[40rem] min-h-[6rem] p-2"
      >
        <div className="relative flex flex-col justify-between w-full min-h-full h-full space-y-4">
          <div className="space-y-4">
            {filters.map((filter, idx) => (
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
              <Button
                size="sm"
                colorScheme="gray"
                onClick={addFilter}
                leftIcon={<PlusIcon className="h-4 text-gray-600" />}
              >
                Add a filter
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default forwardRef(GroupFiltersPanel);

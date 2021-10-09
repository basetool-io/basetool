import { Button, FormControl, Select, Tooltip } from "@chakra-ui/react";
import { Column } from "@/features/fields/types";
import { IntFilterConditions } from "./IntConditionComponent";
import { PlusIcon, XIcon } from "@heroicons/react/outline";
import { useFilters } from "@/hooks";
import Filter, {
  FilterVerb,
  FilterVerbs,
  IFilter,
  IFilterGroup,
} from "@/features/tables/components/Filter";
import React, { forwardRef } from "react";

const GroupFiltersPanel = (
  {
    columns,
    verb,
    filters: groupFilters,
    idx: parentIdx,
  }: { columns: Column[]; verb: FilterVerb; filters: IFilter[]; idx: number },
  ref: any
) => {
  const { filters, removeFilter, updateFilter } = useFilters();

  const addFilter = () => {
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

  const changeFilterGroupVerb = (verb: FilterVerb) => {
    const groupFilter = filters[parentIdx];
    updateFilter(parentIdx, {
      ...groupFilter,
      verb,
    });
  };

  return (
    <div className="flex">
      <FormControl id="verb" className={parentIdx === 1 ? "min-w-[65px] max-w-[65px] pt-2 mr-1" : "min-w-[65px] max-w-[65px] pt-3 mr-1"}>
        {parentIdx === 0 && (
          <div className="text-gray-800 text-right text-sm font-mono">
            where
          </div>
        )}
        {parentIdx > 1 && (
          <div className="text-gray-800 text-right text-sm font-mono">
            {verb}
          </div>
        )}

        {parentIdx === 1 && (
          <Select
            size="xs"
            className="font-mono"
            value={verb}
            onChange={(e) =>
              changeFilterGroupVerb(e.currentTarget.value as FilterVerb)
            }
          >
            {Object.entries(FilterVerbs).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </Select>
        )}
      </FormControl>
      <div
        ref={ref}
        className="border flex flex-1 bg-white z-20 min-w-[20rem] min-h-[3rem] p-2"
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
              <Button
                size="xs"
                colorScheme="gray"
                onClick={addFilter}
                leftIcon={<PlusIcon className="h-3 text-gray-600" />}
              >
                Add a filter
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="align-top pt-2.5">
        <Tooltip label="Remove filter group">
          <Button size="xs" variant="link" onClick={() => removeFilterGroup()}>
            <XIcon className="h-3 text-gray-700" />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};

export default forwardRef(GroupFiltersPanel);

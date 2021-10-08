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
  // const { filters, setFilters, applyFilters, allFiltersApplied } = useFilters();
  const { filters, setFilters, removeFilter, updateFilter } = useFilters();

  // const [localFilters, setLocalFilters] = useState<IFilter[]>(initialFilters);

  const addFilter = () => {
    const filter: IFilter = {
      columnName: columns[0].name,
      column: columns[0],
      condition: IntFilterConditions.is,
      value: "",
      verb: groupFilters.length > 1 ? groupFilters[1].verb : FilterVerbs.and,
    };

    // setLocalFilters([...localFilters, filter]);

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

  // useEffect(() => {
  //   const groupFilter = filters[parentIdx] as IFilterGroup;

  //   updateFilter(parentIdx, {
  //     ...groupFilter,
  //     filters: localFilters,
  //   });
  // }, [localFilters])

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
            size="sm"
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
        className="border flex flex-1 rounded-md bg-white z-20 min-w-[40rem] min-h-[6rem] p-2"
      >
        <div className="relative flex flex-col justify-between w-full min-h-full h-full space-y-4">
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

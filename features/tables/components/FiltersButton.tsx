import { Button, ButtonGroup, IconButton, Tooltip } from "@chakra-ui/react";
import { FilterIcon, XIcon } from "@heroicons/react/outline";
import { IFilter, IFilterGroup } from "@/features/tables/types";
import { isEmpty } from "lodash";
import { useFilters } from "@/features/records/hooks";
import React from "react";

function FiltersButton({
  filtersButtonRef,
  toggleFiltersPanelVisible,
}: {
  filtersButtonRef: any;
  toggleFiltersPanelVisible: () => void;
}) {
  const { appliedFilters, appliedNonBaseFilters, removeAppliedFilter } =
    useFilters();

  const resetNonBaseFilters = () => {
    appliedFilters.forEach((filter: IFilter | IFilterGroup, idx: number) => {
      if (!filter.isBase) {
        removeAppliedFilter(idx);
      }
    });
  };

  return (
    <ButtonGroup size="xs" variant="outline" isAttached>
      <Button
        onClick={() => toggleFiltersPanelVisible()}
        ref={filtersButtonRef}
        leftIcon={<FilterIcon className="h-3 text-gray-600" />}
      >
        <div className="text-gray-800">Filters</div>
        {!isEmpty(appliedFilters) && (
          <>
            <div className="text-gray-600 font-thin mr-1 ml-1">|</div>
            <div className="text-blue-600 font-thin">
              {appliedFilters.length}
            </div>
          </>
        )}
      </Button>
      {!isEmpty(appliedNonBaseFilters) && (
        <Tooltip label="Reset filters">
          <IconButton
            aria-label="Remove filters"
            icon={<XIcon className="h-3" />}
            onClick={resetNonBaseFilters}
          />
        </Tooltip>
      )}
    </ButtonGroup>
  );
}

export default FiltersButton;

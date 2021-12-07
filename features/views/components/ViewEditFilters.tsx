import {
  ChevronDownIcon,
  ChevronLeftIcon,
  PencilAltIcon,
} from "@heroicons/react/outline";
import { Collapse, Tooltip, useDisclosure } from "@chakra-ui/react";
import { FilterOrFilterGroup } from "@/features/tables/types";
import { useBoolean, useClickAway } from "react-use";
import { useDataSourceContext, useSegment } from "@/hooks";
import { useFilters } from "@/features/records/hooks";
import CompactFiltersView from "@/features/views/components/CompactFiltersView";
import FiltersPanel from "@/features/tables/components/FiltersPanel";
import React, { useRef } from "react";
import TinyLabel from "@/components/TinyLabel";

const ViewEditFilters = ({
  updateFilters,
}: {
  updateFilters: (filters: FilterOrFilterGroup[]) => void;
}) => {
  const track = useSegment();
  const { isOpen: isFiltersOpen, onToggle: toggleFiltersOpen } = useDisclosure({
    defaultIsOpen: true,
  });
  const { viewId } = useDataSourceContext();
  const [filtersPanelVisible, toggleFiltersPanelVisible] = useBoolean(false);
  const filtersButton = useRef(null);
  const filtersPanel = useRef(null);
  useClickAway(filtersPanel, (e) => {
    // When a user click the filters button to close the filters panel, the button is still outside,
    // so the action triggers twice closing and opening the filters panel.
    if (filtersButton?.current &&
      !(filtersButton?.current as any)?.contains(e.target)) {
      toggleFiltersPanelVisible(false);
    }
  });
  const { appliedFilters } = useFilters();

  const onApplyFilters = (filters: FilterOrFilterGroup[]) => {
    if (updateFilters) updateFilters(filters);

    track("Applied filters on view edit page", {
      viewId,
    });
  };

  const handleEditFiltersClick = () => {
    toggleFiltersPanelVisible();

    track("Clicked edit filters button", {
      viewId,
      action: filtersPanelVisible ? "close" : "open",
    });
  };

  return (
    <div>
      <div className="relative flex justify-between w-full">
        <div className="w-full cursor-pointer " onClick={toggleFiltersOpen}>
          <TinyLabel>Base filters</TinyLabel>{" "}
          {isFiltersOpen ? (
            <ChevronDownIcon className="h-3 inline" />
          ) : (
            <ChevronLeftIcon className="h-3 inline" />
          )}
        </div>
        <Tooltip label="Edit filters">
          <div
            className="flex justify-center items-center mx-1 text-xs cursor-pointer"
            onClick={handleEditFiltersClick}
            ref={filtersButton}
          >
            <PencilAltIcon className="h-4 inline mr-px" /> Edit
          </div>
        </Tooltip>
        {filtersPanelVisible && (
          <div className="absolute left-auto right-0 -top-8">
            <FiltersPanel onApplyFilters={onApplyFilters} ref={filtersPanel} />
          </div>
        )}
      </div>
      <Collapse in={isFiltersOpen}>
        <CompactFiltersView filters={appliedFilters} />
      </Collapse>
    </div>
  );
};

export default ViewEditFilters;

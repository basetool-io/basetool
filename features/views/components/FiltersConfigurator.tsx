import {
  ChevronDownIcon,
  ChevronLeftIcon,
  PencilAltIcon,
} from "@heroicons/react/outline";
import {
  Collapse,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { DecoratedView } from "@/features/views/types"
import { useBoolean, useClickAway } from "react-use";
import { useDataSourceContext } from "@/hooks";
import { useFilters } from "@/features/records/hooks";
import {
  useGetViewQuery,
} from "@/features/views/api-slice";
import CompactFiltersView from "@/features/views/components/CompactFiltersView";
import FiltersPanel from "@/features/tables/components/FiltersPanel";
import React, { useRef } from "react";
import TinyLabel from "@/components/TinyLabel";

const FiltersConfigurator = ({
  view,
  setView,
}: {
  view: DecoratedView;
  setView: (view: DecoratedView) => void;
}) => {
  const { isOpen: isFiltersOpen, onToggle: toggleFiltersOpen } = useDisclosure({
    defaultIsOpen: true,
  });
  const { viewId, dataSourceId, tableName } = useDataSourceContext();

  const {
    data: viewResponse,
    isLoading: viewIsLoading,
    error: viewError,
  } = useGetViewQuery({ viewId }, { skip: !viewId });

  const [filtersPanelVisible, toggleFiltersPanelVisible] = useBoolean(false);
  const filtersButton = useRef(null);
  const filtersPanel = useRef(null);
  useClickAway(filtersPanel, (e) => {
    // When a user click the filters button to close the filters panel, the button is still outside,
    // so the action triggers twice closing and opening the filters panel.
    if (e.target !== filtersButton.current) {
      toggleFiltersPanelVisible(false);
    }
  });
  const { appliedFilters } = useFilters(
    viewResponse?.data?.filters
  );

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
            onClick={() => toggleFiltersPanelVisible()}
            ref={filtersButton}
          >
            <PencilAltIcon className="h-4 inline mr-px" /> Edit
          </div>
        </Tooltip>
        {filtersPanelVisible && (
          <div className="absolute left-auto right-0 -top-8">
            <FiltersPanel ref={filtersPanel} />
          </div>
        )}
      </div>
      <Collapse in={isFiltersOpen}>
        <CompactFiltersView filters={appliedFilters} />
      </Collapse>
    </div>
  );
};

export default FiltersConfigurator

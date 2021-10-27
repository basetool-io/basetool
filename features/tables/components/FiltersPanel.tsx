import { Button } from "@chakra-ui/react";
import { FilterVerbs, getDefaultFilterCondition } from "..";
import {
  FolderAddIcon,
  PlusIcon,
  ReceiptRefundIcon,
} from "@heroicons/react/outline";
import { IFilter, IFilterGroup } from "../types";
import { columnsSelector } from "@/features/records/state-slice";
import { useAppSelector, useDataSourceContext } from "@/hooks";
import { useFilters } from "@/features/records/hooks";
import { useRouter } from "next/router";
import Filter from "./Filter";
import GroupFiltersPanel from "./GroupFiltersPanel";
import React, { forwardRef, useMemo } from "react";
import classNames from "classnames";
import isEmpty from "lodash/isEmpty";

const FiltersPanel = ({}, ref: any) => {
  const router = useRouter();
  const { viewId } = useDataSourceContext();
  const columns = useAppSelector(columnsSelector);
  const { filters, setFilters, applyFilters, allFiltersApplied } = useFilters();

  const addFilter = () => {
    if (!columns) return

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

  const isEditBaseFilters = useMemo(
    () => router.asPath.endsWith("/edit") && viewId,
    [viewId, router]
  );

  return (
    <div
      ref={ref}
      className="absolute border rounded-md shadow-lg bg-white z-20 min-w-[31.2rem] min-h-[6rem] p-4 mt-8"
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
              const FilterComponent = () => {
                if ("isGroup" in filter && filter.isGroup) {
                  return (
                    <GroupFiltersPanel
                      idx={idx}
                      columns={columns}
                      verb={(filter as IFilterGroup).verb}
                      filters={(filter as IFilterGroup).filters}
                    />
                  );
                }

                return (
                  <Filter
                    key={idx}
                    idx={idx}
                    columns={columns}
                    filter={filter as IFilter}
                  />
                );
              };

              return (
                <div
                  key={idx}
                  className={classNames({
                    "opacity-60 pointer-events-none":
                      filter?.isBase && !isEditBaseFilters,
                  })}
                >
                  <FilterComponent />
                </div>
              );
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

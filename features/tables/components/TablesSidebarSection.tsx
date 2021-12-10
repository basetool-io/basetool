import { ChevronDownIcon, ChevronLeftIcon } from "@heroicons/react/outline";
import { Collapse, useDisclosure } from "@chakra-ui/react";
import { ListTable } from "@/plugins/data-sources/abstract-sql-query-service/types";
import { first, isUndefined } from "lodash";
import { useDataSourceContext, useProfile } from "@/hooks";
import { useDataSourceResponse } from "@/features/data-sources/hooks";
import { useGetTablesQuery } from "@/features/tables/api-slice";
import { usePrefetch } from "@/features/fields/api-slice";
import React, { useMemo } from "react";
import Shimmer from "@/components/Shimmer";
import SidebarItem from "@/components/SidebarItem";

const TablesSidebarSection = () => {
  const { dataSourceId, tableName, viewId } = useDataSourceContext();

  const { isLoading: sessionIsLoading } = useProfile();

  const { dataSource, info } = useDataSourceResponse(dataSourceId);

  const {
    data: tablesResponse,
    isLoading: tablesAreLoading,
    error: tablesError,
  } = useGetTablesQuery({ dataSourceId }, { skip: !dataSourceId });

  const prefetchColumns = usePrefetch("getColumns");

  const { isOpen: isTablesOpen, onToggle: toggleTablesOpen } = useDisclosure({
    defaultIsOpen: true,
  });

  const tablesLoading = useMemo(
    () => tablesAreLoading || sessionIsLoading,
    [tablesAreLoading || sessionIsLoading]
  );

  return (
    <>
      {tablesError && (
        <div>
          {"data" in tablesError && first((tablesError?.data as any)?.messages)}
        </div>
      )}
      <div className="relative space-y-1 flex-1">
        <div
          className="text-md font-semibold py-2 px-2 rounded-md leading-none m-0 cursor-pointer"
          onClick={toggleTablesOpen}
        >
          Tables{" "}
          <span className="text-xs text-gray-500">
            (visible only to owners)
          </span>
          {isTablesOpen ? (
            <ChevronDownIcon className="h-3 inline" />
          ) : (
            <ChevronLeftIcon className="h-3 inline" />
          )}
        </div>
        <Collapse in={isTablesOpen}>
          <div className="">
            {tablesLoading && (
              <div className="flex-1 min-h-full px-1 space-y-2 mt-3">
                <Shimmer height={16} width={50} />
                <Shimmer height={16} width={60} />
                <Shimmer height={16} width={120} />
                <Shimmer height={16} width={90} />
                <Shimmer height={16} width={60} />
                <Shimmer height={16} width={110} />
                <Shimmer height={16} width={90} />
              </div>
            )}
            {/* @todo: why does the .data attribute remain populated with old content when the hooks has changed? */}
            {/* Got to a valid DS and then to an invalid one. the data attribute will still have the old data there. */}
            {!tablesLoading &&
              tablesResponse?.ok &&
              tablesResponse.data
                .filter((table: ListTable) =>
                  dataSource?.type === "postgresql" && table.schema
                    ? table.schema === "public"
                    : true
                )
                .map((table: ListTable, idx: number) => (
                  <SidebarItem
                    key={idx}
                    active={table.name === tableName && isUndefined(viewId)}
                    label={table.name}
                    link={`/data-sources/${dataSourceId}/tables/${table.name}`}
                    onMouseOver={() => {
                      // If the datasource supports columns request we'll prefetch it on hover.
                      if (info?.supports?.columnsRequest) {
                        prefetchColumns({
                          dataSourceId,
                          tableName: table.name,
                        });
                      }
                    }}
                  />
                ))}
          </div>
        </Collapse>
      </div>
    </>
  );
};

export default TablesSidebarSection;

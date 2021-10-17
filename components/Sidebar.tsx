import {
  ChevronDownIcon,
  ChevronLeftIcon,
  PencilAltIcon,
  PlusIcon,
} from "@heroicons/react/outline";
import { Collapse, useDisclosure } from "@chakra-ui/react";
import { ListTable } from "@/plugins/data-sources/abstract-sql-query-service/types";
import { View } from "@/plugins/views/types";
import { getLabel } from "@/features/data-sources";
import { useAccessControl } from "@/hooks";
import { useGetDataSourceQuery } from "@/features/data-sources/api-slice";
import { useGetTablesQuery, usePrefetch } from "@/features/tables/api-slice";
import { useGetViewsQuery } from "@/features/views/api-slice";
import { useRouter } from "next/router";
import Link from "next/link";
import LoadingOverlay from "./LoadingOverlay";
import React, { memo } from "react";
import Shimmer from "./Shimmer";
import SidebarItem from "./SidebarItem";
import isEmpty from "lodash/isEmpty";

const Sidebar = () => {
  const router = useRouter();
  const dataSourceId = router.query.dataSourceId as string;
  const tableName = router.query.tableName as string;
  const { data: dataSourceResponse, isLoading: dataSourceIsLoading } =
    useGetDataSourceQuery(
      { dataSourceId },
      {
        skip: !dataSourceId,
      }
    );
  const {
    data: tablesResponse,
    isLoading: tablesAreLoading,
    error,
  } = useGetTablesQuery(
    { dataSourceId },
    {
      skip: !dataSourceId,
    }
  );

  const prefetchColumns = usePrefetch("getColumns");

  const ac = useAccessControl();

  const { isOpen: isTablesOpen, onToggle: toggleTablesOpen } = useDisclosure({
    defaultIsOpen: true,
  });
  const { isOpen: isViewsOpen, onToggle: toggleViewsOpen } = useDisclosure({
    defaultIsOpen: true,
  });

  const {
    data: viewsResponse,
    isLoading: viewsAreLoading,
    error: viewsError,
  } = useGetViewsQuery(
    { dataSourceId },
    {
      skip: !dataSourceId,
    }
  );

  const viewId = router.query.viewId as string;

  return (
    <div className="relative py-2 pl-2 w-full overflow-y-auto">
      <div className="relative space-y-x w-full h-full flex flex-col">
        <div className="my-2 mt-4 px-4 font-bold uppercase text leading-none">
          {dataSourceIsLoading ? (
            <>
              <Shimmer width={190} height={17} className="mb-2" />
              <Shimmer width={50} height={12} />
            </>
          ) : (
            <>
              <span>{dataSourceResponse?.data?.name}</span>
              <br />
              <Link href={`/data-sources/${dataSourceId}/edit`}>
                <a className="inline-block items-center text-xs text-gray-600 cursor-pointer relative mt-1">
                  <PencilAltIcon className="h-4 inline" /> Edit
                </a>
              </Link>
            </>
          )}
        </div>
        <hr className="-mt-px mb-2" />
        {viewsError && (
          <div>{"data" in viewsError && (viewsError?.data as any)?.messages[0]}</div>
        )}
        <div className="relative space-y-1 px-2 flex-col">
          <div
            className="text-md font-semibold py-2 px-2 rounded-md leading-none m-0"
            onClick={toggleViewsOpen}
          >
            Views{" "}
            {isViewsOpen ? (
              <ChevronDownIcon className="h-4 inline pb-1" />
            ) : (
              <ChevronLeftIcon className="h-4 inline pb-1" />
            )}
          </div>

          <Collapse in={isViewsOpen}>
            <Link href={`/data-sources/${dataSourceId}/views/new`} passHref>
              <div className="flex justify-center items-center border-2 rounded-md border-dashed border-gray-500 py-6 text-gray-600 cursor-pointer mb-2">
                <PlusIcon className="h-4 mr-1 flex flex-shrink-0" />Create view
              </div>
            </Link>

            {viewsAreLoading && (
              <div className="flex-1 min-h-full">
                <LoadingOverlay
                  transparent={isEmpty(viewsResponse?.data)}
                  subTitle={false}
                />
              </div>
            )}
            {viewsResponse?.ok &&
              viewsResponse.data
                .map((view: View, idx: number) => (
                  <SidebarItem
                    key={idx}
                    active={view.id === parseInt(viewId)}
                    label={view.name}
                    link={`/data-sources/${dataSourceId}/views/${view.id}`}
                  />
                ))}
          </Collapse>
        </div>
        <hr className="mt-2 mb-2" />
        {error && (
          <div>{"data" in error && (error?.data as any)?.messages[0]}</div>
        )}
        <div className="relative space-y-1 px-2 flex-1">
          <div
            className="text-md font-semibold py-2 px-2 rounded-md leading-none m-0"
            onClick={toggleTablesOpen}
          >
            Tables{" "}
            {isTablesOpen ? (
              <ChevronDownIcon className="h-4 inline pb-1" />
            ) : (
              <ChevronLeftIcon className="h-4 inline pb-1" />
            )}
          </div>
          <Collapse in={isTablesOpen}>
            {tablesAreLoading && (
              <div className="flex-1 min-h-full">
                <LoadingOverlay
                  transparent={isEmpty(tablesResponse?.data)}
                  subTitle={false}
                />
              </div>
            )}
            {/* @todo: why does the .data attribute remain populated with old content when the hooks has changed? */}
            {/* Got to a valid DS and then to an invalid one. the data attribute will still have the old data there. */}
            {tablesResponse?.ok &&
              tablesResponse.data
                .filter((table: ListTable) =>
                  dataSourceResponse?.data.type === "postgresql" && table.schema
                    ? table.schema === "public"
                    : true
                )
                .filter((table: ListTable) => ac.canViewTable(table))
                .filter((table: ListTable) => !table?.hidden)
                .map((table: ListTable, idx: number) => (
                  <SidebarItem
                    key={idx}
                    active={table.name === tableName}
                    label={getLabel(table)}
                    link={`/data-sources/${dataSourceId}/tables/${table.name}`}
                    onMouseOver={() => {
                      prefetchColumns({
                        dataSourceId,
                        tableName: table.name,
                      });
                    }}
                  />
                ))}
          </Collapse>
        </div>
      </div>
    </div>
  );
};

export default memo(Sidebar);

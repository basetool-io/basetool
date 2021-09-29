import { ListTable } from "@/plugins/data-sources/postgresql/types";
import { PencilAltIcon } from "@heroicons/react/outline";
import { getLabel } from "@/features/data-sources";
import { useAccessControl } from "@/hooks";
import { useGetDataSourceQuery } from "@/features/data-sources/api-slice";
import { useGetTablesQuery, usePrefetch } from "@/features/tables/api-slice";
import { useRouter } from "next/router";
import Link from "next/link";
import LoadingOverlay from "./LoadingOverlay";
import React, { memo } from "react";
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
    isLoading,
    error,
  } = useGetTablesQuery(
    { dataSourceId },
    {
      skip: !dataSourceId,
    }
  );

  const prefetchColumns = usePrefetch("getColumns");

  const ac = useAccessControl();

  return (
    <div className="relative py-2 pl-2 w-full">
      {!router.query.dataSourceId && "Select a data source"}
      <div className="relative space-y-x w-full h-full flex flex-col">
        {dataSourceResponse?.ok && (
          <div className="my-2 mt-4 px-4 font-bold uppercase text-sm leading-none">
            {dataSourceIsLoading ? (
              "Loading..."
            ) : (
              <span>{dataSourceResponse?.data?.name}</span>
            )}
            <br />
            <Link href={`/data-sources/${dataSourceId}/edit`}>
              <a className="mt-1 flex-inline items-center text-xs text-gray-600 cursor-pointer">
                <PencilAltIcon className="h-4 inline" /> Edit
              </a>
            </Link>
          </div>
        )}
        {error && <div>Error: {(error as any).error}</div>}
        {isLoading && (
          <LoadingOverlay
            transparent={isEmpty(tablesResponse?.data)}
            subTitle={false}
          />
        )}
        <div className="space-y-1">
          {/* @todo: why does the .data attribute remain populated with old content when the hooks has changed? */}
          {/* Got to a valid DS and then to an invalid one. the data attribute will still have the old data there. */}
          {tablesResponse?.ok &&
            tablesResponse.data
              .filter((table: ListTable) =>
                table.schemaname ? table.schemaname === "public" : true
              )
              .filter((table: ListTable) => ac.canViewTable(table))
              .map((table: ListTable, idx: number) => <SidebarItem
                key={idx}
                active={table.name === tableName}
                label={getLabel(table)}
                link={`/data-sources/${dataSourceId}/tables/${table.name}`}
                onMouseOver={() => {
                  prefetchColumns({
                    dataSourceId,
                    tableName: table.name,
                  })
                } } />)}
        </div>
      </div>
    </div>
  );
};

export default memo(Sidebar);

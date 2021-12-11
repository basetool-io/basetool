import { PencilAltIcon } from "@heroicons/react/outline";
import { useACLHelpers } from "@/features/authorization/hooks";
import { useDataSourceContext } from "@/hooks";
import { useDataSourceResponse } from "@/features/data-sources/hooks";
import DashboardSidebarSection from "@/features/dashboards/components/DashboardsSidebarSection";
import Link from "next/link";
import React, { memo } from "react";
import Shimmer from "./Shimmer";
import TablesSidebarSection from "@/features/tables/components/TablesSidebarSection";
import ViewsSidebarSection from "@/features/views/components/ViewsSidebarSection";

const Sidebar = () => {
  const { dataSourceId } = useDataSourceContext();
  const {
    dataSource,
    isLoading: dataSourceIsLoading,
    info: dataSourceInfo,
  } = useDataSourceResponse(dataSourceId);
  const { isOwner } = useACLHelpers({ dataSourceInfo });

  return (
    <div className="relative py-2 pl-2 w-full">
      <div className="relative space-y-x w-full h-full flex flex-col overflow-y-auto">
        <div className="my-2 mt-4 px-2 font-bold uppercase text leading-none">
          {dataSourceIsLoading && (
            <>
              <Shimmer width={190} height={17} className="mb-2" />
              <Shimmer width={50} height={12} />
            </>
          )}
          {!dataSourceIsLoading && dataSourceId && (
            <>
              <span>{dataSource?.name}</span>
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
        {false && <DashboardSidebarSection />}
        {dataSourceInfo?.supports?.views && <ViewsSidebarSection />}
        {isOwner && <TablesSidebarSection />}
      </div>
    </div>
  );
};

export default memo(Sidebar);

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  PlusCircleIcon,
  PlusIcon,
} from "@heroicons/react/outline";
import { Collapse, Tooltip, useDisclosure } from "@chakra-ui/react";
import { View } from "@prisma/client";
import { first } from "lodash";
import { useDataSourceContext, useProfile } from "@/hooks";
import { useGetViewsQuery } from "@/features/views/api-slice";
import Link from "next/link";
import React, { useMemo } from "react";
import Shimmer from "@/components/Shimmer";
import SidebarItem from "@/components/SidebarItem";

const ViewsSidebarSection = () => {
  const { dataSourceId, viewId } = useDataSourceContext();
  const { user, isLoading: sessionIsLoading } = useProfile();

  const {
    data: viewsResponse,
    isLoading: viewsAreLoading,
    error: viewsError,
  } = useGetViewsQuery();

  const { isOpen: isViewsOpen, onToggle: toggleViewsOpen } = useDisclosure({
    defaultIsOpen: true,
  });

  const views = useMemo(
    () => (viewsResponse?.ok ? viewsResponse?.data : []),
    [viewsResponse]
  );

  const filteredViews = useMemo(
    () =>
      views.filter(
        (view: View) =>
          (view.createdBy === user.id || view.public === true) &&
          view.dataSourceId === parseInt(dataSourceId)
      ),
    [views, dataSourceId]
  );

  const viewsLoading = useMemo(
    () => viewsAreLoading || sessionIsLoading,
    [viewsAreLoading || sessionIsLoading]
  );

  return (
    <>
      {viewsError && (
        <div>
          {"data" in viewsError && first((viewsError?.data as any)?.messages)}
        </div>
      )}
      <div className="relative space-y-1 flex-col">
        <div className="flex justify-between w-full">
          <div
            className="text-md font-semibold py-2 px-2 rounded-md leading-none m-0 w-full cursor-pointer"
            onClick={toggleViewsOpen}
          >
            Views{" "}
            {isViewsOpen ? (
              <ChevronDownIcon className="h-3 inline" />
            ) : (
              <ChevronLeftIcon className="h-3 inline" />
            )}
          </div>
          {filteredViews.length > 0 && (
            <Link href={`/views/new?dataSourceId=${dataSourceId}`}>
              <a className="flex justify-center items-center mx-2">
                <Tooltip label="Add view">
                  <div>
                    <PlusCircleIcon className="h-4 inline cursor-pointer" />
                  </div>
                </Tooltip>
              </a>
            </Link>
          )}
        </div>

        <Collapse in={isViewsOpen}>
          {viewsLoading && (
            <div className="flex-1 min-h-full px-1 space-y-2 mt-3">
              <Shimmer height={16} width={50} />
              <Shimmer height={16} width={90} />
              <Shimmer height={16} width={110} />
              <Shimmer height={16} width={60} />
            </div>
          )}
          {/* If no views are present, show a nice box with the create message */}
          {!viewsLoading && filteredViews.length === 0 && (
            <Link href={`/views/new?dataSourceId=${dataSourceId}`} passHref>
              <div className="flex justify-center items-center border-2 rounded-md border-dashed border-gray-500 py-6 text-gray-600 cursor-pointer mb-2">
                <PlusIcon className="h-4 mr-1 flex flex-shrink-0" />
                Create view
              </div>
            </Link>
          )}
          {/* display only views created by logged in user or public views and having same datasource */}
          {!viewsLoading &&
            filteredViews.map((view: View, idx: number) => (
              <SidebarItem
                key={idx}
                active={view.id === parseInt(viewId)}
                label={view.name}
                link={`/views/${view.id}`}
              />
            ))}
        </Collapse>
      </div>
      <hr className="mt-2 mb-2" />
    </>
  );
};

export default ViewsSidebarSection;

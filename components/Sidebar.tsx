import {
  Button,
  Collapse,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  PencilAltIcon,
  PlusCircleIcon,
  PlusIcon,
} from "@heroicons/react/outline";
import { Dashboard, View } from "@prisma/client";
import { ListTable } from "@/plugins/data-sources/abstract-sql-query-service/types";
import { first, isUndefined } from "lodash";
import { useACLHelpers } from "@/features/authorization/hooks";
import {
  useAddDashboardMutation,
  useGetDashboardsQuery,
} from "@/features/dashboards/api-slice";
import { useDataSourceContext, useProfile } from "@/hooks";
import { useDataSourceResponse } from "@/features/data-sources/hooks";
import { useGetTablesQuery } from "@/features/tables/api-slice";
import { useGetViewsQuery } from "@/features/views/api-slice";
import { usePrefetch } from "@/features/fields/api-slice";
import { useRouter } from "next/router";
import Link from "next/link";
import React, { forwardRef, memo, useMemo, useRef, useState } from "react";
import Shimmer from "./Shimmer";
import SidebarItem from "./SidebarItem";

const Sidebar = () => {
  const { dataSourceId, tableName, viewId } = useDataSourceContext();
  const dashboardId = "2";

  const { user, isLoading: sessionIsLoading } = useProfile();

  const {
    dataSource,
    info,
    isLoading: dataSourceIsLoading,
    info: dataSourceInfo,
  } = useDataSourceResponse(dataSourceId);

  const { isOwner } = useACLHelpers({ dataSourceInfo });

  const {
    data: tablesResponse,
    isLoading: tablesAreLoading,
    error: tablesError,
  } = useGetTablesQuery({ dataSourceId }, { skip: !dataSourceId });

  const {
    data: viewsResponse,
    isLoading: viewsAreLoading,
    error: viewsError,
  } = useGetViewsQuery();

  const {
    data: dashboardsResponse,
    isLoading: dashboardsAreLoading,
    error: dashboardsError,
  } = useGetDashboardsQuery();

  const prefetchColumns = usePrefetch("getColumns");

  const { isOpen: isTablesOpen, onToggle: toggleTablesOpen } = useDisclosure({
    defaultIsOpen: true,
  });
  const { isOpen: isViewsOpen, onToggle: toggleViewsOpen } = useDisclosure({
    defaultIsOpen: true,
  });
  const { isOpen: isDashboardsOpen, onToggle: toggleDashboardsOpen } =
    useDisclosure({
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

  const dashboards = useMemo(
    () => (dashboardsResponse?.ok ? dashboardsResponse?.data : []),
    [dashboardsResponse]
  );

  const filteredDashboards = useMemo(
    () =>
      dashboards.filter(
        (dashboard: Dashboard) =>
          dashboard.createdBy === user.id || dashboard.isPublic === true
      ),
    [dashboards]
  );

  const viewsLoading = useMemo(
    () => viewsAreLoading || sessionIsLoading,
    [viewsAreLoading || sessionIsLoading]
  );

  const tablesLoading = useMemo(
    () => tablesAreLoading || sessionIsLoading,
    [tablesAreLoading || sessionIsLoading]
  );

  const dashboardsLoading = useMemo(
    () => dashboardsAreLoading || sessionIsLoading,
    [dashboardsAreLoading || sessionIsLoading]
  );

  const ViewsSection = () => (
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

  const { onOpen, onClose, isOpen } = useDisclosure();
  const firstFieldRef = useRef(null);

  const NameInput = forwardRef((props: any, ref: any) => {
    return (
      <FormControl>
        <FormLabel htmlFor="name">Name</FormLabel>
        <Input ref={ref} id="name" size="sm" {...props} />
        <FormHelperText>What should the dashboard be called.</FormHelperText>
      </FormControl>
    );
  });
  NameInput.displayName = "NameInput";

  const Form = ({
    firstFieldRef,
    onClose,
  }: {
    firstFieldRef: any;
    onClose: () => void;
  }) => {
    const [name, setName] = useState("");
    const [addDashboard, { isLoading }] = useAddDashboardMutation();
    const router = useRouter();

    const createField = async () => {
      if (name.length < 3) return;

      const response = await addDashboard({
        body: { name },
      }).unwrap();

      if (response?.ok) {
        router.push(`/dashboards/${response.data.id}`);
        onClose();
      }
    };

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createField();
        }}
      >
        <NameInput
          ref={firstFieldRef}
          onChange={(e: any) => setName(e.currentTarget.value)}
        />
        <div className="mt-2">
          <Button
            type="submit"
            size="sm"
            colorScheme="blue"
            width="100%"
            isDisabled={name.length < 3}
            isLoading={isLoading}
            leftIcon={<PlusIcon className="text-white h-4" />}
          >
            Add dashboard
          </Button>
        </div>
      </form>
    );
  };

  const DashboardsSection = () => (
    <>
      {dashboardsError && (
        <div>
          {"data" in dashboardsError &&
            first((dashboardsError?.data as any)?.messages)}
        </div>
      )}
      <div className="relative space-y-1 flex-col">
        <div className="flex justify-between w-full">
          <div
            className="text-md font-semibold py-2 px-2 rounded-md leading-none m-0 w-full cursor-pointer"
            onClick={toggleDashboardsOpen}
          >
            Dashboards{" "}
            {isDashboardsOpen ? (
              <ChevronDownIcon className="h-3 inline" />
            ) : (
              <ChevronLeftIcon className="h-3 inline" />
            )}
          </div>
          <div className="flex items-center mx-2">
            <Popover
              isOpen={isOpen}
              initialFocusRef={firstFieldRef}
              onOpen={onOpen}
              onClose={onClose}
            >
              <PopoverTrigger>
                <div>
                  <Tooltip label="Add dashboard">
                    <div>
                      <PlusCircleIcon className="h-4 inline cursor-pointer" />
                    </div>
                  </Tooltip>
                </div>
              </PopoverTrigger>
              <PopoverContent>
                <PopoverArrow />
                <PopoverBody>
                  <Form firstFieldRef={firstFieldRef} onClose={onClose} />
                </PopoverBody>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Collapse in={isDashboardsOpen}>
          {dashboardsLoading && (
            <div className="flex-1 min-h-full px-1 space-y-2 mt-3">
              <Shimmer height={16} width={50} />
              <Shimmer height={16} width={70} />
              <Shimmer height={16} width={60} />
            </div>
          )}
          {!dashboardsLoading &&
            filteredDashboards.map((dashboard: Dashboard, idx: number) => (
              <SidebarItem
                key={idx}
                active={dashboard.id === parseInt(dashboardId)}
                label={dashboard.name}
                link={`/dashboards/${dashboard.id}`}
              />
            ))}
        </Collapse>
      </div>
      <hr className="mt-2 mb-2" />
    </>
  );

  const TablesSection = () => (
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

  const DataSourceSection = () => (
    <>
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
    </>
  );

  return (
    <div className="relative py-2 pl-2 w-full overflow-y-auto">
      <div className="relative space-y-x w-full h-full flex flex-col">
        <DataSourceSection />
        <DashboardsSection />
        {dataSourceInfo?.supports?.views && <ViewsSection />}
        {isOwner && <TablesSection />}
      </div>
    </div>
  );
};

export default memo(Sidebar);

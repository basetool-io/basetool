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
  PlusCircleIcon,
  PlusIcon,
} from "@heroicons/react/outline";
import { Dashboard } from "@prisma/client";
import { Portal } from "@chakra-ui/react";
import { first } from "lodash";
import {
  useAddDashboardMutation,
  useGetDashboardsQuery,
} from "@/features/dashboards/api-slice";
import { useDataSourceContext, useProfile } from "@/hooks";
import { useRouter } from "next/router";
import React, { forwardRef, useMemo, useRef, useState } from "react";
import Shimmer from "@/components/Shimmer";
import SidebarItem from "@/components/SidebarItem";

const DashboardsSidebarSection = () => {
  const { dataSourceId, dashboardId } = useDataSourceContext();
  const { user, isLoading: sessionIsLoading } = useProfile();

  const {
    data: dashboardsResponse,
    isLoading: dashboardsAreLoading,
    error: dashboardsError,
  } = useGetDashboardsQuery({ dataSourceId }, { skip: !dataSourceId });

  const { isOpen: isDashboardsOpen, onToggle: toggleDashboardsOpen } =
    useDisclosure({
      defaultIsOpen: true,
    });

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

  const dashboardsLoading = useMemo(
    () => dashboardsAreLoading || sessionIsLoading,
    [dashboardsAreLoading || sessionIsLoading]
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
        body: { name, dataSourceId },
      }).unwrap();

      if (response?.ok) {
        router.push(`/dashboards/${response.data.id}/edit`);
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

  const ContentForPopover = () => (
    <Portal>
      <PopoverContent
        rootProps={{
          style: {
            zIndex: 40,
          },
        }}
      >
        <PopoverArrow />
        <PopoverBody>
          <Form firstFieldRef={firstFieldRef} onClose={onClose} />
        </PopoverBody>
      </PopoverContent>
    </Portal>
  );

  return (
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
          {filteredDashboards.length > 0 && (
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
                <ContentForPopover />
              </Popover>
            </div>
          )}
        </div>

        <Collapse in={isDashboardsOpen}>
          {dashboardsLoading && (
            <div className="flex-1 min-h-full px-1 space-y-2 mt-3">
              <Shimmer height={16} width={50} />
              <Shimmer height={16} width={70} />
              <Shimmer height={16} width={60} />
            </div>
          )}

          {!dashboardsLoading && filteredDashboards.length === 0 && (
            <Popover
              isOpen={isOpen}
              initialFocusRef={firstFieldRef}
              onOpen={onOpen}
              onClose={onClose}
            >
              <PopoverTrigger>
                <div className="flex justify-center items-center border-2 rounded-md border-dashed border-gray-500 py-6 text-gray-600 cursor-pointer mb-2">
                  <PlusIcon className="h-4 mr-1 flex flex-shrink-0" />
                  Create dashboard
                </div>
              </PopoverTrigger>
              <ContentForPopover />
            </Popover>
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
};

export default DashboardsSidebarSection;

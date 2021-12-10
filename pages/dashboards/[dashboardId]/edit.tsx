import { Button } from "@chakra-ui/react";
import { Dashboard } from "@prisma/client";
import { TrashIcon } from "@heroicons/react/outline";
import { useDataSourceContext } from "@/hooks";
import {
  useGetDashboardQuery,
  useRemoveDashboardMutation,
} from "@/features/dashboards/api-slice";
import { useRouter } from "next/router";
import BackButton from "@/features/records/components/BackButton";
import Layout from "@/components/Layout";
import PageWrapper from "@/components/PageWrapper";
import React, { memo, useMemo } from "react";

const Edit = () => {
  const router = useRouter();
  const { dashboardId, dataSourceId } = useDataSourceContext();

  const {
    data: dashboardResponse,
    isLoading: dashboardIsLoading,
    error: dashboardError,
  } = useGetDashboardQuery({ dashboardId }, { skip: !dashboardId });

  const dashboard: Dashboard | undefined = useMemo(
    () => dashboardResponse?.ok && dashboardResponse.data,
    [dashboardResponse]
  );

  const backLink = dashboardId ? `/dashboards/${dashboardId}` : "";
  const crumbs = useMemo(
    () => ["Edit dashboard", dashboard?.name],
    [dashboard?.name]
  );

  const [removeDashboard, { isLoading: dashboardIsRemoving }] =
    useRemoveDashboardMutation();

  const handleRemove = async () => {
    if (dashboardIsLoading || dashboardIsRemoving) return;

    const confirmed = confirm(
      "Are you sure you want to remove this dashboard? All information about it (settings included) will be completely removed from our servers."
    );
    if (confirmed) {
      await removeDashboard({ dashboardId }).unwrap();
      await router.push(`/data-sources/${dataSourceId}`);
    }
  };

  // const [updateView] = useUpdateViewMutation();

  // const body = useMemo(() => {
  //   return pick(
  //     {
  //       ...view,
  //       filters: convertToBaseFilters(appliedFilters as []),
  //     },
  //     ["name", "public", "dataSourceId", "tableName", "filters", "defaultOrder"]
  //   );
  // }, [view, appliedFilters]);

  // const commitViewUpdate = async (
  //   key: string,
  //   value: string | boolean | OrderParams[] | FilterOrFilterGroup[]
  // ) => {
  //   await updateView({
  //     viewId,
  //     body: {
  //       ...body,
  //       [key]: value,
  //     },
  //   }).unwrap();
  // };

  // const updateName = async (name: string) => {
  //   if (name !== view?.name) commitViewUpdate("name", name);
  // };

  // const updateVisibility = async (publicView: boolean) => {
  //   commitViewUpdate("public", publicView);
  // };

  // const updateOrder = async (defaultOrder: OrderParams[]) => {
  //   commitViewUpdate("defaultOrder", defaultOrder);
  // };

  // const updateFilters = async (filters: FilterOrFilterGroup[]) => {
  //   commitViewUpdate("filters", filters);
  // };

  return (
    <Layout hideSidebar={true}>
      <PageWrapper
        isLoading={dashboardIsLoading}
        error={dashboardError}
        crumbs={crumbs}
        footerElements={{
          left: (
            <Button
              colorScheme="red"
              size="xs"
              variant="outline"
              onClick={handleRemove}
              isLoading={dashboardIsRemoving}
              leftIcon={<TrashIcon className="h-4" />}
            >
              Delete dashboard
            </Button>
          ),
        }}
        buttons={
          dashboardId && (
            <BackButton href={backLink}>Back to dashboard</BackButton>
          )
        }
        flush={true}
      >
        <div className="relative flex-1 max-w-full w-full flex">
          <div className="flex flex-shrink-0 w-1/4 border-r p-4">
            {dashboard && (
              <div className="flex flex-col space-y-4 w-full">
                {/* <ViewEditName updateName={updateName} />
                <ViewEditVisibility updateVisibility={updateVisibility} />
                <ViewEditFilters updateFilters={updateFilters} />
                <ViewEditOrder view={view} updateOrder={updateOrder} />
                <ViewEditColumns columnsAreLoading={columnsAreLoading} />
                <ViewEditDataSourceInfo /> */}
                HERE EDIT DASHBOARD
              </div>
            )}
          </div>
          <div className="relative flex-1 flex h-full max-w-3/4 w-3/4">
            {/* {column && <FieldEditor />} */}
            <div className="flex-1 flex overflow-auto">
              HERE WILL BE WIDGETS
            </div>
          </div>
        </div>
      </PageWrapper>
    </Layout>
  );
};

export default memo(Edit);

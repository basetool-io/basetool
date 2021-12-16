import { Button } from "@chakra-ui/react";
import { TrashIcon } from "@heroicons/react/outline";
import { pick } from "lodash";
import { useDashboardResponse, useUpdateWidget } from "@/features/dashboards/hooks";
import { useDataSourceContext } from "@/hooks";
import {
  useDeleteDashboardMutation,
  useUpdateDashboardMutation,
} from "@/features/dashboards/api-slice";
import { useRouter } from "next/router";
import BackButton from "@/features/records/components/BackButton";
import DashboardEditDataSourceInfo from "@/features/dashboards/components/DashboardEditDataSourceInfo";
import DashboardEditName from "@/features/dashboards/components/DashboardEditName";
import DashboardEditVisibility from "@/features/dashboards/components/DashboardEditVisibility";
import DashboardEditWidgets from "@/features/dashboards/components/DashboardEditWidgets";
import DashboardPage from "@/features/dashboards/components/DashboardPage";
import Layout from "@/components/Layout";
import PageWrapper from "@/components/PageWrapper";
import React, { memo, useMemo } from "react";
import WidgetEditor from "@/features/dashboards/components/WidgetEditor";

const Edit = () => {
  const router = useRouter();
  const { dashboardId, dataSourceId } = useDataSourceContext();
  const {
    dashboard,
    isLoading: dashboardIsLoading,
    error: dashboardError,
  } = useDashboardResponse(dashboardId);

  const backLink = dashboardId ? `/dashboards/${dashboardId}` : "";
  const crumbs = useMemo(
    () => ["Edit dashboard", dashboard?.name],
    [dashboard?.name]
  );

  const [removeDashboard, { isLoading: dashboardIsRemoving }] =
    useDeleteDashboardMutation();

  const handleRemove = async () => {
    if (dashboardIsLoading || dashboardIsRemoving) return;

    const confirmed = confirm(
      "Are you sure you want to remove this dashboard? All information, settings, and widgets will be completely removed from our servers."
    );
    if (confirmed) {
      await removeDashboard({ dashboardId }).unwrap();
      await router.push(`/data-sources/${dataSourceId}`);
    }
  };

  const [updateDashboard] = useUpdateDashboardMutation();

  const body = useMemo(() => {
    return pick(
      {
        ...dashboard,
      },
      ["name", "isPublic", "dataSourceId"]
    );
  }, [dashboard]);

  const commitDashboardUpdate = async (
    key: string,
    value: string | boolean
  ) => {
    await updateDashboard({
      dashboardId,
      body: {
        ...body,
        [key]: value,
      },
    }).unwrap();
  };

  const updateName = async (name: string) => {
    if (name !== dashboard?.name) commitDashboardUpdate("name", name);
  };

  const updateVisibility = async (publicView: boolean) => {
    commitDashboardUpdate("isPublic", publicView);
  };

  const { widget } = useUpdateWidget();

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
                <DashboardEditName updateName={updateName} />
                <DashboardEditVisibility updateVisibility={updateVisibility} />
                <DashboardEditDataSourceInfo />
                <DashboardEditWidgets />
              </div>
            )}
          </div>
          <div className="relative flex-1 flex h-full max-w-3/4 w-3/4">
            {widget && <WidgetEditor />}
            <DashboardPage isEditPage={true} />
          </div>
        </div>
      </PageWrapper>
    </Layout>
  );
};

export default memo(Edit);

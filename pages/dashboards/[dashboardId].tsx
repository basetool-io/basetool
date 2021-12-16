import { Button, ButtonGroup, IconButton, Link } from "@chakra-ui/react";
import { PencilAltIcon, RefreshIcon } from "@heroicons/react/outline";
import { useACLHelpers } from "@/features/authorization/hooks";
import { useDashboardResponse } from "@/features/dashboards/hooks";
import { useDataSourceContext } from "@/hooks";
import { useDataSourceResponse } from "@/features/data-sources/hooks";
import { useEffect } from "react";
import { useLazyGetWidgetsValuesQuery } from "@/features/dashboards/api-slice";
import DashboardPage from "@/features/dashboards/components/DashboardPage";
import Layout from "@/components/Layout";
import PageWrapper from "@/components/PageWrapper";

const DashboardView = () => {
  const { dataSourceId, dashboardId } = useDataSourceContext();
  const { info } = useDataSourceResponse(dataSourceId);
  const { canEdit } = useACLHelpers({ dataSourceInfo: info });

  const {
    dashboard,
    widgets,
    isLoading: dashboardIsLoading,
  } = useDashboardResponse(dashboardId);

  const [getWidgetsValues, { isFetching: widgetsValuesAreFetching }] =
    useLazyGetWidgetsValuesQuery();

  useEffect(() => {
    if (dashboardId) getWidgetsValues({ dashboardId });
  }, [dashboardId]);

  const EditDashboardButton = () => (
    <Link href={`/dashboards/${dashboardId}/edit`} passHref>
      <Button
        as="a"
        colorScheme="blue"
        variant="ghost"
        leftIcon={<PencilAltIcon className="h-4" />}
      >
        Edit dashboard
      </Button>
    </Link>
  );

  return (
    <Layout>
      <PageWrapper
        isLoading={dashboardIsLoading}
        heading={
          <>
            {dashboard?.name}
            <IconButton
              size="xs"
              variant="ghost"
              aria-label="Refresh"
              icon={<RefreshIcon className="h-4" />}
              className="ml-3 no-focus"
              onClick={() => getWidgetsValues({ dashboardId })}
              isLoading={widgetsValuesAreFetching}
              isDisabled={widgets.length === 0}
            />
          </>
        }
        buttons={
          <ButtonGroup size="xs">
            {canEdit && dashboardId && <EditDashboardButton />}
          </ButtonGroup>
        }
        bodyClassName="bg-neutral-100"
      >
        <DashboardPage />
      </PageWrapper>
    </Layout>
  );
};

export default DashboardView;

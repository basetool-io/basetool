import { Button, ButtonGroup, IconButton, Link } from "@chakra-ui/react";
import { PencilAltIcon, RefreshIcon } from "@heroicons/react/outline";
import { useACLHelpers } from "@/features/authorization/hooks";
import { useDashboardResponse } from "@/features/dashboards/hooks";
import { useDataSourceContext } from "@/hooks";
import { useDataSourceResponse } from "@/features/data-sources/hooks";
import { useLazyGetWidgetsValuesQuery } from "@/features/dashboards/api-slice";
import DashboardPage from "@/features/dashboards/components/DashboardPage";
import Layout from "@/components/Layout";
import PageWrapper from "@/components/PageWrapper";

const DashboardView = () => {
  const { dataSourceId, dashboardId } = useDataSourceContext();
  const { info } = useDataSourceResponse(dataSourceId);
  const { canEdit } = useACLHelpers({ dataSourceInfo: info });

  const { dashboard, isLoading: dashboardIsLoading } =
    useDashboardResponse(dashboardId);

  const [getWidgetsValues, { data: widgetsValuesResponse, isLoading: widgetsValuesIsLoading }] =
    useLazyGetWidgetsValuesQuery();

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

  const refreshValues = () => {
    getWidgetsValues({ dashboardId })
    console.log('widgetsValuesResponse->', widgetsValuesResponse)
  }

  return (
    <Layout>
      <PageWrapper
        isLoading={dashboardIsLoading}
        heading={
          <>
            {dashboard?.name}
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="Refresh"
              icon={<RefreshIcon className="h-4" />}
              className="ml-3"
              onClick={refreshValues}
              isLoading={widgetsValuesIsLoading}
            />
          </>
        }
        buttons={
          <ButtonGroup size="xs">
            {canEdit && dashboardId && <EditDashboardButton />}
          </ButtonGroup>
        }
      >
        <DashboardPage />
      </PageWrapper>
    </Layout>
  );
};

export default DashboardView;

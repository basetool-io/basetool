import { Button, ButtonGroup, Link } from "@chakra-ui/react";
import { PencilAltIcon } from "@heroicons/react/outline";
import { useACLHelpers } from "@/features/authorization/hooks";
import { useDashboardResponse } from "@/features/dashboards/hooks";
import { useDataSourceContext } from "@/hooks";
import { useDataSourceResponse } from "@/features/data-sources/hooks";
import DashboardPage from "@/features/dashboards/components/DashboardPage";
import Layout from "@/components/Layout";
import PageWrapper from "@/components/PageWrapper";

const DashboardView = () => {
  const { dataSourceId, dashboardId } = useDataSourceContext();
  const { info } = useDataSourceResponse(dataSourceId);
  const { canEdit } = useACLHelpers({ dataSourceInfo: info });

  const { dashboard, isLoading: dashboardIsLoading } =
    useDashboardResponse(dashboardId);

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
        heading={`Dashboard ${dashboard?.name}`}
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

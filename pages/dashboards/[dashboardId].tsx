import { Button, ButtonGroup, Link } from "@chakra-ui/react";
import { PencilAltIcon } from "@heroicons/react/outline";
import { useACLHelpers } from "@/features/authorization/hooks";
import { useDashboardResponse } from "@/features/dashboards/hooks";
import { useDataSourceContext } from "@/hooks";
import { useDataSourceResponse } from "@/features/data-sources/hooks";
import Layout from "@/components/Layout";
import PageWrapper from "@/components/PageWrapper";

const DashboardView = () => {
  const { dataSourceId, dashboardId } = useDataSourceContext();
  const { info } = useDataSourceResponse(dataSourceId);
  const { canEdit } = useACLHelpers({ dataSourceInfo: info});

  const { dashboard } = useDashboardResponse(dashboardId);

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
        heading={`Dashboard ${dashboard?.name}`}
        buttons={
          <ButtonGroup size="xs">
            {canEdit && dashboardId && <EditDashboardButton />}
          </ButtonGroup>
        }
      >
        <div className="relative flex flex-col flex-1 w-full h-full">
          WIDGETS COMING SOON...
        </div>
      </PageWrapper>
    </Layout>
  );
};

export default DashboardView;

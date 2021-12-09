import { Dashboard } from "@prisma/client";
import { useGetDashboardQuery } from "@/features/dashboards/api-slice";
import { useMemo } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import PageWrapper from "@/components/PageWrapper";

const ViewShow = () => {
  const router = useRouter();
  const dashboardId = router.query.dashboardId as string;

  const {
    data: dashboardResponse,
    isLoading: dashboardIsLoading,
    error: dashboardError,
  } = useGetDashboardQuery({ dashboardId }, { skip: !dashboardId });

  const dashboard: Dashboard | undefined = useMemo(
    () => dashboardResponse?.ok && dashboardResponse.data,
    [dashboardResponse]
  );

  return (
    <Layout>
      <PageWrapper
        heading={`Dashboard`}
        flush={true}
        buttons={
          <></>
        }
        footer={
          <></>
        }
      >
        <div className="relative flex flex-col flex-1 w-full h-full">
          Dashboard Info:
          {dashboard && <p>{JSON.stringify(dashboard)}</p>}
        </div>
      </PageWrapper>
    </Layout>
  );
};

export default ViewShow;

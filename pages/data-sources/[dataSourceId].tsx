import { DataSourceOptions } from "@/features/data-sources/types";
import { View } from "@prisma/client";
import { isEmpty, isNull } from "lodash";
import { useDataSourceContext, useProfile } from "@/hooks";
import { useDataSourceResponse } from "@/features/data-sources/hooks";
import { useGetTablesQuery } from "@/features/tables/api-slice";
import { useGetViewsQuery } from "@/features/views/api-slice";
import { useRouter } from "next/router";
import GoogleSheetsSetup from "@/components/GoogleSheetsSetup";
import Layout from "@/components/Layout";
import PageWrapper from "@/components/PageWrapper";
import React, { useEffect, useMemo } from "react";
import Shimmer from "@/components/Shimmer";
import ShimmerOrCount from "@/components/ShimmerOrCount";

function DataSourcesShow() {
  const router = useRouter();
  const { dataSourceId } = useDataSourceContext();
  const { dataSource, isLoading: dataSourceIsLoading } =
    useDataSourceResponse(dataSourceId);
  const { data: tablesResponse, isLoading: tablesAreLoading } =
    useGetTablesQuery({ dataSourceId }, { skip: !dataSourceId });

  const { user, organizations, isLoading: sessionIsLoading } = useProfile();
  const organization = useMemo(
    () => organizations.find((o) => o.id === dataSource?.organizationId),
    [organizations]
  );

  const { data: viewsResponse, isLoading: viewsAreLoading } =
    useGetViewsQuery();
  const views = useMemo(
    () => (viewsResponse?.ok ? viewsResponse.data : []),
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

  const showGoogleSheetsSetup = useMemo(
    () => isNull((dataSource?.options as any)?.spreadsheetId),
    [(dataSource?.options as any)?.spreadsheetId]
  );

  const homepageLink = useMemo(() => {
    if(!dataSource) return "";

    let homepageLink = "";

    const homepage = (dataSource?.options as DataSourceOptions)?.homepage;
    if (homepage) {
      const parts = homepage.split(":");
      homepageLink = `/${parts[0]}s/${parts[1]}`;
    } else {
      homepageLink = `/data-sources/${dataSource.id}`;
    }

    return homepageLink;
  }, [dataSource]);

  useEffect(() => {
    if(!isEmpty(homepageLink) && router.asPath !== homepageLink) {
      router.push(homepageLink);
    }
  }, [homepageLink]);

  return (
    <Layout>
      <>
        {showGoogleSheetsSetup && <GoogleSheetsSetup />}
        {showGoogleSheetsSetup || (
          <PageWrapper
            heading={
              dataSourceIsLoading ? (
                <Shimmer height={28} width={120} />
              ) : (
                dataSource?.name
              )
            }
          >
            <div>
              This data source has{" "}
              <ShimmerOrCount
                item="table"
                count={tablesResponse?.data?.length}
                isLoading={tablesAreLoading}
              />{" "}
              and{" "}
              <ShimmerOrCount
                item="view"
                count={filteredViews.length}
                isLoading={viewsAreLoading}
              />
              .{" "}
              {organization && (
                <>
                  There are{" "}
                  <ShimmerOrCount
                    item="member"
                    count={organization?.users?.length}
                    isLoading={sessionIsLoading}
                  />{" "}
                  that may see the views you configured.
                  <br />
                  {filteredViews.length > 0 && (
                    <>👈 Select a view to get started.</>
                  )}
                  {filteredViews.length === 0 && (
                    <>👈 Create view to get started.</>
                  )}
                </>
              )}
            </div>
          </PageWrapper>
        )}
      </>
    </Layout>
  );
}

export default DataSourcesShow;

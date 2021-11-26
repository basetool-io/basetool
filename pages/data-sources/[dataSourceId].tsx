import { isNull } from "lodash";
import { useDataSourceContext, useProfile } from "@/hooks";
import { useDataSourceResponse } from "@/features/data-sources/hooks";
import { useGetTablesQuery } from "@/features/tables/api-slice";
import { useGetViewsQuery } from "@/features/views/api-slice";
import GoogleSheetsSetup from "@/components/GoogleSheetsSetup";
import Layout from "@/components/Layout";
import PageWrapper from "@/components/PageWrapper";
import React, { useMemo } from "react";
import ShimmerOrCount from "@/components/ShimmerOrCount";

function DataSourcesShow() {
  const { dataSourceId } = useDataSourceContext();
  const { dataSource } = useDataSourceResponse(dataSourceId);
  const { data: tablesResponse, isLoading: tablesAreLoading } =
    useGetTablesQuery({ dataSourceId }, { skip: !dataSourceId });

  const { data: viewsResponse, isLoading: viewsAreLoading } =
    useGetViewsQuery();
  const views = useMemo(
    () => (viewsResponse?.ok ? viewsResponse.data : []),
    [viewsResponse]
  );

  const showGoogleSheetsSetup = useMemo(
    () => isNull((dataSource?.options as any)?.spreadsheetId),
    [(dataSource?.options as any)?.spreadsheetId]
  );

  const { organizations, isLoading: sessionIsLoading } = useProfile();
  const organization = useMemo(
    () => organizations.find((o) => o.id === dataSource?.organizationId),
    [organizations]
  );

  return (
    <Layout>
      <>
        {showGoogleSheetsSetup && <GoogleSheetsSetup />}
        {showGoogleSheetsSetup || (
          <PageWrapper heading={dataSource?.name}>
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
                count={viewsResponse?.data?.length}
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
                  {views.length > 0 && <>👈 Select a view to get started.</>}
                  {views.length === 0 && <>👈 Create view to get started.</>}
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

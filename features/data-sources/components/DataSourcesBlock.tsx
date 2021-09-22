import { DataSource, Organization, User } from "@prisma/client";
import { useGetDataSourcesQuery } from "../api-slice";
import { usePrefetch } from "@/features/tables/api-slice"
import PageWrapper from "@/components/PageWrapper";
import React from "react";
import Shimmer from "@/components/Shimmer";
import pluralize from "pluralize";

const DataSourcesBlock = () => {
  const {
    data: dataSourcesResponse,
    isLoading,
    error,
  } = useGetDataSourcesQuery();

  const prefetchTables = usePrefetch("getTables");

  return (
    <PageWrapper.Section>
      <PageWrapper.Heading>DataSources</PageWrapper.Heading>
      <PageWrapper.Blocks>
        <>
          {isLoading && (
            <PageWrapper.Block href={`#`}>
              <div className="text-lg font-bold text-gray-800 mb-2">
                <Shimmer />
              </div>
              <br />
              <Shimmer />
            </PageWrapper.Block>
          )}
          {!isLoading &&
            dataSourcesResponse?.ok &&
            dataSourcesResponse?.data.map(
              (
                dataSource: Organization & { users: User[]; dataSources: DataSource[] }
              ) => {
                return (
                  <PageWrapper.Block href={`/data-sources/${dataSource.id}`}
                  onMouseOver={() => {
                    prefetchTables({
                      dataSourceId: dataSource.id.toString(),
                    });
                  }}>
                    <div className="text-lg font-bold text-gray-800 mb-2">
                      {dataSource.name}
                    </div>
                    <br />
                    {dataSource?.dataSources && (
                      <div className="text-sm">
                        {dataSource.dataSources.length}{" "}
                        {pluralize("data source", dataSource.dataSources.length)}
                      </div>
                    )}
                    {dataSource?.users && (
                      <div className="text-sm">
                        {dataSource.users.length}{" "}
                        {pluralize("member", dataSource.users.length)}
                      </div>
                    )}
                  </PageWrapper.Block>
                );
              }
            )}
        </>
      </PageWrapper.Blocks>
    </PageWrapper.Section>
  );
};

export default DataSourcesBlock;

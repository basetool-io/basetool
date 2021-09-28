import { DataSource, Organization } from "@prisma/client";
import { useGetDataSourcesQuery } from "../api-slice";
import { usePrefetch } from "@/features/tables/api-slice";
import Link from "next/link"
import PageWrapper from "@/components/PageWrapper";
import ProfileContext from "@/lib/ProfileContext";
import React, { useContext } from "react";
import Shimmer from "@/components/Shimmer";

const DataSourcesBlock = () => {
  const {
    data: dataSourcesResponse,
    isLoading,
    error,
  } = useGetDataSourcesQuery();
  const { organizations } = useContext(ProfileContext);
  const prefetchTables = usePrefetch("getTables");

  return (
    <PageWrapper.Section>
      <PageWrapper.Heading>Your DataSources</PageWrapper.Heading>
      {dataSourcesResponse?.data.length === 0 && <>You don't have any Basetool data sources. <Link href="/data-sources/new"><a className="text-blue-600 underline">Add one</a></Link> now.</>}
      <PageWrapper.Blocks>
        <>
          {isLoading && (
            <PageWrapper.Block href={`#`}>
              <div className="text-lg font-bold text-gray-800 mb-2">
                Loading
              </div>
              <br />
              <Shimmer />
            </PageWrapper.Block>
          )}

          {!isLoading &&
            dataSourcesResponse?.ok &&
            dataSourcesResponse?.data.map((dataSource: DataSource) => {
              let organization: Organization | undefined = undefined;
              try {
                organization = organizations.find(
                  ({ id }) => id === dataSource?.organizationId
                ) as any;
              } catch (error) {}

              return (
                <PageWrapper.Block
                  href={`/data-sources/${dataSource.id}`}
                  key={dataSource.id}
                  onMouseOver={() => {
                    prefetchTables({
                      dataSourceId: dataSource.id.toString(),
                    });
                  }}
                >
                  <div className="flex flex-col justify-between h-full">
                    <div className="text-lg font-bold text-gray-800 mb-2">
                      {dataSource.name}
                    </div>
                    <br />
                    {organization?.name && (
                      <div className="text-sm">{organization.name}</div>
                    )}
                  </div>
                </PageWrapper.Block>
              );
            })}
        </>
      </PageWrapper.Blocks>
    </PageWrapper.Section>
  );
};

export default DataSourcesBlock;

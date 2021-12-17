import { DataSource, Organization } from "@prisma/client";
import { useGetDataSourcesQuery } from "../api-slice";
import { usePrefetch } from "@/features/tables/api-slice";
import { useProfile } from "@/hooks";
import Image from "next/image";
import Link from "next/link";
import PageWrapper from "@/components/PageWrapper";
import React, { useMemo } from "react";
import Shimmer from "@/components/Shimmer";

const DataSourcesListing = ({
  dataSources,
  isLoading,
}: {
  dataSources: DataSource[];
  isLoading: boolean;
}) => {
  const prefetchTables = usePrefetch("getTables");

  return (
    <PageWrapper.Blocks>
      <>
        {isLoading && (
          <PageWrapper.Block href={`#`}>
            <div className="text-lg font-bold text-gray-800 mb-2">Loading</div>
            <br />
            <Shimmer height={20} />
          </PageWrapper.Block>
        )}

        {dataSources.map((dataSource: DataSource) => (
          <PageWrapper.Block
            href={`/data-sources/${dataSource.id}`}
            key={dataSource.id}
            onMouseOver={() =>
              prefetchTables({
                dataSourceId: dataSource.id.toString(),
              })
            }
          >
            <div className="relative flex flex-col justify-between h-full group">
              <div className="text-lg font-bold text-gray-800 mb-2">
                {dataSource.name}
              </div>
              <div className="absolute top-0 left-auto right-0">
                <div className="relative min-w-[2rem] h-8 filter grayscale group-hover:grayscale-0">
                  <Image
                    src={`/img/logos/${dataSource.type}.png`}
                    layout="fill"
                    alt={`${dataSource.type} data source`}
                  />
                </div>
              </div>
              <br />
            </div>
          </PageWrapper.Block>
        ))}
      </>
    </PageWrapper.Blocks>
  );
};

const DataSourcesBlock = () => {
  const { data: dataSourcesResponse, isLoading: dataSourcesAreLoading } =
    useGetDataSourcesQuery();
  const { organizations, isLoading: profileIsLoading } = useProfile();

  const isLoading = useMemo(
    () => dataSourcesAreLoading || profileIsLoading,
    [dataSourcesAreLoading, profileIsLoading]
  );

  return (
    <PageWrapper.Section>
      <div className="space-y-6">
        {!isLoading &&
          organizations.map((organization: Organization) => {
            const dataSources = dataSourcesResponse?.data.filter(
              (dataSource: DataSource) =>
                dataSource.organizationId === organization.id
            );

            const hasDataSources = dataSources.length > 0;

            return (
              <div>
                <PageWrapper.Heading>
                  <Link href={`/organizations/${organization.slug}/members`}>
                    {organization.name}
                  </Link>
                </PageWrapper.Heading>

                <hr className="mb-4" />

                {!hasDataSources && (
                  <>
                    You don't have any data sources yet.{" "}
                    <Link href="/data-sources/new">
                      <a className="text-blue-600 underline">Add one</a>
                    </Link>{" "}
                    now.
                  </>
                )}

                {hasDataSources && (
                  <DataSourcesListing
                    dataSources={dataSources}
                    isLoading={isLoading}
                  />
                )}
              </div>
            );
          })}
      </div>
    </PageWrapper.Section>
  );
};

export default DataSourcesBlock;

import { DataSource, Organization } from "@prisma/client";
import { useGetDataSourcesQuery } from "../api-slice";
import { usePrefetch } from "@/features/tables/api-slice";
import { useProfile } from "@/hooks";
import Image from "next/image";
import Link from "next/link";
import PageWrapper from "@/components/PageWrapper";
import React, { useMemo } from "react";
import Shimmer from "@/components/Shimmer";

const DataSourcesBlock = () => {
  const { data: dataSourcesResponse, isLoading: dataSourcesAreLoading } =
    useGetDataSourcesQuery();
  const { organizations, isLoading: profileIsLoading } = useProfile();
  const prefetchTables = usePrefetch("getTables");

  const isLoading = useMemo(
    () => dataSourcesAreLoading || profileIsLoading,
    [dataSourcesAreLoading, profileIsLoading]
  );

  return (
    <PageWrapper.Section>
      {dataSourcesResponse?.data.length === 0 && (
        <>
          You don't have any Basetool data sources.{" "}
          <Link href="/data-sources/new">
            <a className="text-blue-600 underline">Add one</a>
          </Link>{" "}
          now.
        </>
      )}
      <div className="space-y-6">
        {!isLoading &&
          organizations.map((organization: Organization) => {
            const dataSources = dataSourcesResponse?.data.filter(
              (dataSource: DataSource) =>
                dataSource.organizationId === organization.id
            );

            return (
              <div>
                <PageWrapper.Heading>
                  <Link href={`/organizations/${organization.slug}/members`}>
                    {organization.name}
                  </Link>
                </PageWrapper.Heading>

                <hr className="mb-4" />

                <PageWrapper.Blocks>
                  <>
                    {isLoading && (
                      <PageWrapper.Block href={`#`}>
                        <div className="text-lg font-bold text-gray-800 mb-2">
                          Loading
                        </div>
                        <br />
                        <Shimmer height={20} />
                      </PageWrapper.Block>
                    )}

                    {dataSources.map((dataSource: DataSource) => (
                      <PageWrapper.Block
                        href={`/data-sources/${dataSource.id}`}
                        key={dataSource.id}
                        onMouseOver={() => {
                          prefetchTables({
                            dataSourceId: dataSource.id.toString(),
                          });
                        }}
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
              </div>
            );
          })}
      </div>
    </PageWrapper.Section>
  );
};

export default DataSourcesBlock;

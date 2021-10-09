import { DataSource } from "@prisma/client";
import { useGetDataSourcesQuery } from "../api-slice";
import { usePrefetch } from "@/features/tables/api-slice";
import { useProfile } from "@/hooks";
import Image from "next/image";
import Link from "next/link";
import PageWrapper from "@/components/PageWrapper";
import React from "react";
import Shimmer from "@/components/Shimmer";

const DataSourcesBlock = () => {
  const { data: dataSourcesResponse, isLoading } = useGetDataSourcesQuery();
  const { organizations } = useProfile();
  const prefetchTables = usePrefetch("getTables");

  return (
    <PageWrapper.Section>
      <PageWrapper.Heading>Your DataSources</PageWrapper.Heading>
      {dataSourcesResponse?.data.length === 0 && (
        <>
          You don't have any Basetool data sources.{" "}
          <Link href="/data-sources/new">
            <a className="text-blue-600 underline">Add one</a>
          </Link>{" "}
          now.
        </>
      )}
      <PageWrapper.Blocks>
        <>
          {isLoading && (
            <PageWrapper.Block href={`#`}>
              <div className="text-lg font-bold text-gray-800 mb-2">
                Loading
              </div>
              <br />
              <Shimmer height={20}/>
            </PageWrapper.Block>
          )}

          {!isLoading &&
            dataSourcesResponse?.ok &&
            dataSourcesResponse?.data.map((dataSource: DataSource) => {
              const organization = organizations.find(
                ({ id }) => id === dataSource?.organizationId
              );

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
                  <div className="relative flex flex-col justify-between h-full group">
                    <div className="text-lg font-bold text-gray-800 mb-2">
                      {dataSource.name}
                    </div>
                    <div className="absolute top-0 left-auto right-0">
                      <div className="relative min-w-[2rem] h-8 filter grayscale group-hover:grayscale-0">
                        <Image src={`/img/logos/${dataSource.type}.png`} layout="fill" alt={`${dataSource.type} data source`} />
                      </div>
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

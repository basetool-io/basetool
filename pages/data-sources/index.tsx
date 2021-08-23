import Layout from "@/components/Layout";
import { useGetDataSourcesQuery } from "@/features/data-sources/api-slice";
import { DataSource } from "@prisma/client";
import Head from "next/head";
import Link from "next/link";
import React from "react";
import { ListItem, OrderedList } from "@chakra-ui/react";

function Index() {
  const {
    data: dataSourcesResponse,
    isLoading,
    error,
  } = useGetDataSourcesQuery();

  return (
    <Layout>
      <Head>
        <title>2Basetool.io</title>
      </Head>
      {isLoading && <div>loading data sources...</div>}
      {error && <div>Error: {JSON.stringify(error)}</div>}
      {!isLoading && dataSourcesResponse?.ok && (
        <div>
          <div className="text-2xl">All data sources:</div>
          <OrderedList>
            {!isLoading &&
              dataSourcesResponse?.ok &&
              dataSourcesResponse.data.map((ds: DataSource) => (
                <ListItem key={ds.id}>
                  <Link href={`/data-sources/${ds.id}`}>{ds.name}</Link>
                </ListItem>
              ))}
          </OrderedList>
        </div>
      )}
    </Layout>
  );
}

export default Index;

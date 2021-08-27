import { isEmpty } from "lodash";
import { useGetDataSourcesQuery } from "@/features/data-sources/api-slice";
import { useRouter } from "next/router";
import { useSession } from "next-auth/client";
import React from "react";
import type { NextPage } from "next";

const Home: NextPage = () => {
  const [session, loading] = useSession();
  const router = useRouter();

  const {
    data: dataSourcesResponse,
    isLoading,
    error,
  } = useGetDataSourcesQuery();

  if (!isLoading) {
    if (dataSourcesResponse?.ok && !isEmpty(dataSourcesResponse?.data)) {
      router.push(`/data-sources/`);
    } else {
      router.push(`/data-sources/new`);
    }
  }

  return <>{isLoading && <div>Loading data sources...</div>}</>;
};

export default Home;

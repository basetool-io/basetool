import { useGetDataSourcesQuery } from "@/features/data-sources/api-slice";
import { isEmpty } from "lodash";
import type { NextPage } from "next";
import { useSession } from "next-auth/client";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

const Home: NextPage = () => {
  const [session, loading] = useSession();
  const router = useRouter();

  const {
    data: dataSourcesResponse,
    isLoading,
    error,
  } = useGetDataSourcesQuery();

  useEffect(() => {
    if (dataSourcesResponse?.ok && !isEmpty(dataSourcesResponse?.data)) {
      router.push(`/data-sources/${dataSourcesResponse?.data.id}`);
    } else {
      router.push(`/data-sources/new`);
    }
  }, []);

  return <>{isLoading && <div>loading...</div>}</>;
};

export default Home;

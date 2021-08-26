import { isEmpty } from "lodash";
import { useGetDataSourcesQuery } from "@/features/data-sources/api-slice";
import { useRouter } from "next/router";
import { useSession } from "next-auth/client";
import React, { useEffect } from "react";
import type { NextPage } from "next";

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

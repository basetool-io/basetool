import { isEmpty } from "lodash";
import { useGetDataSourcesQuery } from "@/features/data-sources/api-slice";
import { useRouter } from "next/router";
import { useSession } from "next-auth/client";
import React, { useEffect } from "react";
import type { NextPage } from "next";

const Home: NextPage = () => {
  const [session, sessionIsLoading] = useSession();
  const router = useRouter();

  const {
    data: dataSourcesResponse,
    isLoading,
  } = useGetDataSourcesQuery();

  useEffect(() => {
    if (session && !sessionIsLoading) {
      router.push('/auth/register')
    }
  }, [session, sessionIsLoading])

  if (!isLoading) {
    if (dataSourcesResponse?.ok && !isEmpty(dataSourcesResponse?.data)) {
      router.push(`/data-sources`);
    } else {
      router.push(`/data-sources/new`);
    }
  }

  return <>{sessionIsLoading || isLoading && <div>Loading...</div>}</>;
};

export default Home;

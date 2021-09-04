import { isEmpty } from "lodash";
import { useGetDataSourcesQuery } from "@/features/data-sources/api-slice";
import { useRouter } from "next/router";
import { useSession } from "next-auth/client";
import LoadingOverlay from "@/components/LoadingOverlay";
import React, { useEffect } from "react";
import type { NextPage } from "next";

const Home: NextPage = () => {
  const [session, sessionIsLoading] = useSession();
  const router = useRouter();

  const { data: dataSourcesResponse, isLoading: dataSourcesLoading } =
    useGetDataSourcesQuery();

  useEffect(() => {
    if (!sessionIsLoading) {
      if (session) {
        if (!dataSourcesLoading) {
          if (dataSourcesResponse?.ok && !isEmpty(dataSourcesResponse?.data)) {
            router.push(`/data-sources`);
          } else {
            router.push(`/data-sources/new`);
          }
        }
      } else {
        router.push("/auth/login");
      }
    }
  }, [session, sessionIsLoading, dataSourcesResponse]);

  return <>{(sessionIsLoading || dataSourcesLoading) && <LoadingOverlay />}</>;
};

export default Home;

import { Button } from "@chakra-ui/react";
import { useGetAuthUrlQuery } from "@/features/data-sources/api-slice";
import Layout from "@/components/Layout";
import Link from "next/link";
import PageWrapper from "@/components/PageWrapper";
import React, { useMemo } from "react";

function New() {
  const { data: authUrlResponse, isLoading } = useGetAuthUrlQuery({
    dataSourceName: "google-sheets",
  });
  const authUrl = useMemo(
    () => (authUrlResponse?.ok ? authUrlResponse?.data?.url : "/"),
    [authUrlResponse]
  );

  return (
    <Layout>
      <PageWrapper heading="Connect your Google account">
        <>
          You will be prompted to share read-write permissions so you can access
          &amp; update your data.
          <div className="block">
            {isLoading && (
              <Button as="a">
                Authenticate with your Google Account (loading)
              </Button>
            )}
            {!isLoading && authUrl && (
              <Link href={authUrl} passHref>
                <Button as="a">
                  Authenticate with your Google Account
                </Button>
              </Link>
            )}
          </div>
        </>
      </PageWrapper>
    </Layout>
  );
}

export default New;

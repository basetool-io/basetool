import { Button } from "@chakra-ui/react";
import { useGetAuthUrlQuery } from "@/features/data-sources/api-slice";
import BackButton from "@/features/records/components/BackButton";
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
    <Layout hideSidebar={true}>
      <PageWrapper
        heading="Connect your Google account"
        buttons={<BackButton href="/data-sources/new" />}
      >
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
                <Button as="a">Authenticate with your Google Account</Button>
              </Link>
            )}
          </div>
        </>
      </PageWrapper>
    </Layout>
  );
}

export default New;

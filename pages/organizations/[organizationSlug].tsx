import { useOrganizationFromContext } from "@/hooks";
import { useRouter } from "next/router";
import DataSourcesBlock from "@/features/data-sources/components/DataSourcesBlock"
import Layout from "@/components/Layout";
import PageWrapper from "@/components/PageWrapper";
import React from "react";

function OrganizationShow() {
  const router = useRouter();
  const organization = useOrganizationFromContext({
    slug: router.query.organizationSlug as string,
  });

  return (
    <Layout hideSidebar={true}>
      <PageWrapper crumbs={[organization?.name, "General"]}>
        <>
          <DataSourcesBlock />
        </>
      </PageWrapper>
    </Layout>
  );
}

export default OrganizationShow;

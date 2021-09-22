import { useOrganizationFromContext } from "@/hooks"
import { useRouter } from "next/router"
import Layout from "@/components/Layout";
import OrganizationSidebar from "@/components/OrganizationSidebar"
import PageWrapper from "@/components/PageWrapper";
import React from "react";

function OrganizationShow() {
  const router = useRouter()
  const organization = useOrganizationFromContext({ slug: (router.query.organizationSlug as string) });

  return (
    <Layout sidebar={<OrganizationSidebar organization={organization} />}>
      <PageWrapper crumbs={[organization?.name, "General"]}>
        <><pre>{JSON.stringify(organization, null, 2)}</pre></>
      </PageWrapper>
    </Layout>
  );
}

export default OrganizationShow;

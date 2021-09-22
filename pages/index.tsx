import Layout from "@/components/Layout";
import OrganizationsBlock from "@/features/organizations/components/OrganizationsBlock"
import PageWrapper from "@/components/PageWrapper";
import ProfileContext from "@/lib/ProfileContext";
import React, { useContext } from "react";
import DataSourcesBlock from "@/features/data-sources/components/DataSourcesBlock"

function Index() {
  const { user } = useContext(ProfileContext);

  return (
    <Layout hideSidebar={true}>
      <PageWrapper heading={`Welcome ${user?.firstName}`}>
        <DataSourcesBlock />
        <OrganizationsBlock />
      </PageWrapper>
    </Layout>
  );
}

export default Index;

import { useProfile } from "@/hooks";
import DataSourcesBlock from "@/features/data-sources/components/DataSourcesBlock";
import DummyDataSources from "@/features/data-sources/components/DummyDataSources";
import Layout from "@/components/Layout";
import OrganizationsBlock from "@/features/organizations/components/OrganizationsBlock";
import PageWrapper from "@/components/PageWrapper";
import React from "react";

function Index() {
  const { user, isLoading: profileIsLoading } = useProfile();

  return (
    <Layout hideSidebar={true}>
      <PageWrapper
        heading={`Welcome ${profileIsLoading ? "" : user?.firstName}`}
      >
        <div className="space-y-8">
          <DataSourcesBlock />
          <OrganizationsBlock />
          <DummyDataSources />
        </div>
      </PageWrapper>
    </Layout>
  );
}

export default Index;

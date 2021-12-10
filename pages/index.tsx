import { COOKIES_FROM_TOOL_NEW } from "@/lib/constants"
import { useCookie } from "react-use";
import { useProfile } from "@/hooks";
import { useRouter } from "next/router";
import DataSourcesBlock from "@/features/data-sources/components/DataSourcesBlock";
import DummyDataSources from "@/features/data-sources/components/DummyDataSources";
import Layout from "@/components/Layout";
import OrganizationsBlock from "@/features/organizations/components/OrganizationsBlock";
import PageWrapper from "@/components/PageWrapper";
import React, { useEffect } from "react";

function Index() {
  const router = useRouter();
  const { user, isLoading: profileIsLoading } = useProfile();
  const [cookie, _, deleteCookie] = useCookie(COOKIES_FROM_TOOL_NEW);

  useEffect(() => {
    if (cookie === "1") {
      deleteCookie();
      router.push("/data-sources/new");
    }
  }, [cookie]);

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

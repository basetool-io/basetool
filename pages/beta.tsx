import Layout from "@/components/Layout";
import PageWrapper from "@/components/PageWrapper";
import React from "react";

function Beta() {
  return (
    <Layout hideSidebar={true}>
      <PageWrapper heading="Beta">
        <>
          Basetool is currently in beta. If you run into issues, don't hesitate to contact us.
        </>
      </PageWrapper>
    </Layout>
  );
}

export default Beta;

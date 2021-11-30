import { useSegment } from "@/hooks";
import Layout from "@/components/Layout";
import Link from "next/link";
import PageWrapper from "@/components/PageWrapper";
import React from "react";

function Beta() {
  useSegment("Visited beta page", {
    page: "beta",
  });

  return (
    <Layout hideSidebar={true}>
      <PageWrapper heading="basetool beta">
        <>
          <div className="block">
            <p className="mb-2">
              Basetool is currently in beta. You are some of the first users to
              try it out, and we thank you for that. Myself (
              <a
                href="https://twitter.com/adrianthedev"
                target="_blank"
                rel="noreferrer"
                title="Adrian Marin"
                className="underline"
              >
                Adrian
              </a>
              ) and my brother (
              <a
                href="https://twitter.com/mihaimdm"
                target="_blank"
                rel="noreferrer"
                title="Mihai David Marin"
                className="underline"
              >
                David
              </a>
              ) are waiting for your feedback.
            </p>
            <p className="mb-2">
              If you run into any issues, don't hesitate to contact us at{" "}
              <a className="inline underline" href="mailto:adrian@basetool.io">
                adrian@basetool.io
              </a>{" "}
              and{" "}
              <a className="inline underline" href="mailto:david@basetool.io">
                david@basetool.io
              </a>{" "}
              , through Intercom 👇 or open up an{" "}
              <Link href="https://github.com/basetool-io/basetool/issues/new/choose">
                <a className="inline underline">issue on GitHub</a>
              </Link>
              .
            </p>

            <p className="mb-2 text-gray-500">
              * This page is only shown to organization owners.
            </p>
          </div>
        </>
      </PageWrapper>
    </Layout>
  );
}

export default Beta;

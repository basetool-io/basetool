import { availableDataSources } from "@/plugins/data-sources";
import Image from "next/image";
import Layout from "@/components/Layout";
import Link from "next/link";
import PageWrapper from "@/components/PageWrapper";
import React from "react";

function New() {
  return (
    <Layout>
      <PageWrapper heading="Select data source type">
        <div className="flex justify-center">
          <div className="max-w-lg">
            <div className="grid grid-cols-2 gap-6">
              {availableDataSources.map(({ id, label, enabled }) => (
                <Link href={`/data-sources/${id}/new`} key={id}>
                  <a key={id} className="border shadow-md px-12 py-8 rounded text-center">
                    <div className="relative h-12 mb-4">
                      <Image
                        src={`/img/logos/${id}.png`}
                        alt={`New ${id} data-source`}
                        layout="fill"
                        objectFit="contain"
                      />
                    </div>
                    {label}
                  </a>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </PageWrapper>
    </Layout>
  );
}

export default New;

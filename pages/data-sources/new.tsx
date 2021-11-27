import { ArrowRightIcon } from "@heroicons/react/outline";
import { Button } from "@chakra-ui/react";
import { availableDataSources } from "@/plugins/data-sources";
import { useRouter } from "next/router";
import DataSourceTileCreate from "@/features/data-sources/components/DataSourceTileCreate";
import Layout from "@/components/Layout";
import PageWrapper from "@/components/PageWrapper";
import React, { useState } from "react";

function New() {
  const router = useRouter();
  const [dataSourceId, setDataSourceId] = useState("");

  const next = async () => {
    await router.push({
      pathname: `/data-sources/${dataSourceId}/new`,
    });
  };
  const selectDataSource = async (id: string) => {
    setDataSourceId(id);
  };

  return (
    <Layout hideSidebar={true}>
      <PageWrapper
        heading="Select data source type"
        footer={
          <PageWrapper.Footer
            center={
              <Button
                type="submit"
                colorScheme="blue"
                size="sm"
                width="300px"
                onClick={() => next()}
              >
                Next <ArrowRightIcon className="h-4" />
              </Button>
            }
          />
        }
      >
        <div className="flex justify-center">
          <div className="max-w-3xl">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {availableDataSources.map(
                ({ id, label, beta, comingSoon, readOnly }) => (
                  <DataSourceTileCreate
                    id={id}
                    label={label}
                    beta={beta}
                    comingSoon={comingSoon}
                    readOnly={readOnly}
                    selectDataSource={() => selectDataSource(id)}
                    dataSourceId={dataSourceId}
                  />
                )
              )}
            </div>
          </div>
        </div>
      </PageWrapper>
    </Layout>
  );
}

export default New;

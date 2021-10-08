import { Button } from "@chakra-ui/react";
import { TrashIcon } from "@heroicons/react/outline";
import { merge } from "lodash";
import {
  useGetDataSourceQuery,
  useRemoveDataSourceMutation,
} from "@/features/data-sources/api-slice";
import { useRouter } from "next/router";
import BackButton from "@/features/records/components/BackButton";
import DataSourceEditSidebar from "@/features/data-sources/components/DataSourceEditSidebar";
import Layout from "@/components/Layout";
import PageWrapper from "@/components/PageWrapper";
import React, { ReactElement } from "react";

const DataSourcesEditLayout = ({
  dataSourceId,
  backLink,
  backLabel = "Back",
  crumbs,
  isLoading = false,
  footerElements,
  children,
}: {
  dataSourceId?: string;
  backLink?: string;
  backLabel?: string;
  crumbs?: string[];
  isLoading?: boolean;
  footerElements?: {
    left?: ReactElement | string;
    center?: ReactElement | string;
    right?: ReactElement | string;
  };
  children?: ReactElement;
}) => {
  const router = useRouter();
  dataSourceId ||= router.query.dataSourceId as string;

  const {
    data: dataSourceResponse,
    error: dataSourceError,
    isLoading: dataSourceIsLoading,
  } = useGetDataSourceQuery(
    { dataSourceId },
    {
      skip: !dataSourceId,
    }
  );

  backLink ||= `/data-sources/${router.query.dataSourceId}/`;
  crumbs ||= [dataSourceResponse?.data?.name, "Edit"];

  const [removeDataSource, { isLoading: dataSourceIsRemoving }] =
    useRemoveDataSourceMutation();

  const handleRemove = async () => {
    if (dataSourceIsLoading || dataSourceIsRemoving) return;

    const confirmed = confirm(
      "Are you sure you want to remove this data source? All information about it (settings included) will be completely removed from our servers."
    );
    if (confirmed) {
      await removeDataSource({ dataSourceId }).unwrap();
      await router.push("/");
    }
  };

  return (
    <Layout hideSidebar={true}>
      <PageWrapper
        isLoading={dataSourceIsLoading || isLoading}
        error={dataSourceError}
        crumbs={crumbs}
        footerElements={merge(
          {
            left: (
              <Button
                colorScheme="red"
                size="xs"
                variant="outline"
                onClick={handleRemove}
                isLoading={dataSourceIsRemoving}
                leftIcon={<TrashIcon className="h-4" />}
              >
                Remove data source
              </Button>
            ),
          },
          footerElements
        )}
        buttons={<BackButton href={backLink}>{backLabel}</BackButton>}
        flush={true}
      >
        <div className="relative flex-1 max-w-full w-full flex">
          <div className="flex flex-shrink-0 w-1/4 border-r">
            <DataSourceEditSidebar />
          </div>
          {children && children}
          {!children && (
            <div className="flex-1 p-4">👈 Select a table to get started</div>
          )}
        </div>
      </PageWrapper>
    </Layout>
  );
};

export default DataSourcesEditLayout;

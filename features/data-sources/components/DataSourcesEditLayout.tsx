import { Button } from "@chakra-ui/react";
import { TrashIcon } from "@heroicons/react/outline";
import { useDataSourceContext } from "@/hooks";
import {
  useGetDataSourceQuery,
  useRemoveDataSourceMutation,
} from "@/features/data-sources/api-slice";
import { useRouter } from "next/router";
import BackButton from "@/features/records/components/BackButton";
import DataSourceEditName from "@/features/data-sources/components/DataSourceEditName";
import Layout from "@/components/Layout";
import PageWrapper from "@/components/PageWrapper";
import React, { ReactElement, memo } from "react";

const DataSourcesEditLayout = ({
  dataSourceId,
  backLink,
  backLabel = "Back",
  crumbs,
  isLoading = false,
  footerElements,
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
}) => {
  const router = useRouter();
  const { dataSourceId: appRouterDataSourceId } = useDataSourceContext();
  dataSourceId ||= appRouterDataSourceId;

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

  backLink ||= `/data-sources/${dataSourceId}/`;
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
        footerElements={footerElements}
        buttons={<BackButton href={backLink}>{backLabel}</BackButton>}
        flush={true}
      >
        <div className="relative flex-1 max-w-full w-full flex justify-center">
          <div className="w-72">
            <DataSourceEditName />
            <Button
              className="mt-10"
              isFullWidth={true}
              colorScheme="red"
              size="xs"
              variant="outline"
              onClick={handleRemove}
              isLoading={dataSourceIsRemoving}
              leftIcon={<TrashIcon className="h-4" />}
            >
              Remove data source
            </Button>
          </div>
        </div>
      </PageWrapper>
    </Layout>
  );
};

export default memo(DataSourcesEditLayout);

import { Button } from "@chakra-ui/react";
import { Save } from "react-feather";
import { TrashIcon } from "@heroicons/react/outline";
import { useDataSourceContext } from "@/hooks";
import { useGetViewQuery, useRemoveViewMutation } from "@/features/views/api-slice";
import { useRouter } from "next/router";
import BackButton from "@/features/records/components/BackButton";
import Layout from "@/components/Layout";
import PageWrapper from "@/components/PageWrapper";
import React from "react";
import RecordsIndex from "@/features/records/components/RecordsIndex";

const Edit = () => {
  const router = useRouter();
  const { viewId, dataSourceId } = useDataSourceContext();

  const {
    data: viewResponse,
    isLoading: viewIsLoading,
    error: viewError,
  } = useGetViewQuery({ viewId }, { skip: !viewId });

  const backLink = `/views/${viewId}/`;
  const crumbs = [viewResponse?.data?.name, "Edit"];

  const [removeView, { isLoading: viewIsRemoving }] =
    useRemoveViewMutation();

  const handleRemove = async () => {
    if (viewIsLoading || viewIsRemoving) return;

    const confirmed = confirm(
      "Are you sure you want to remove this view? All information about it (settings included) will be completely removed from our servers."
    );
    if (confirmed) {
      await removeView({ viewId }).unwrap();
      await router.push(`/data-sources/${dataSourceId}`);
    }
  };

  return (
    <Layout hideSidebar={true}>
      <PageWrapper
        // isLoading={dataSourceIsLoading || isLoading}
        // error={dataSourceError}
        crumbs={crumbs}
        footerElements={{
          left: (
            <Button
              colorScheme="red"
              size="xs"
              variant="outline"
              onClick={handleRemove}
              isLoading={viewIsRemoving}
              leftIcon={<TrashIcon className="h-4" />}
            >
              Remove view
            </Button>
          ),
          center: (
            <Button
              colorScheme="blue"
              size="sm"
              width="300px"
              // onClick={handleSubmit}
              // isLoading={isUpdating}
              leftIcon={<Save className="h-4" />}
            >
              Save
            </Button>
          ),
        }}
        buttons={<BackButton href={backLink}>Back</BackButton>}
        flush={true}
      >
        <div className="relative flex-1 max-w-full w-full flex">
          <div className="flex flex-shrink-0 w-1/4 border-r">
            HERE WILL BE EDIT
          </div>
          <div className="relative flex-1 flex h-full max-w-full w-full opacity-60 pointer-events-none">
            <RecordsIndex displayOnlyTable={true} />
          </div>
        </div>
      </PageWrapper>
    </Layout>
  );
};

export default Edit;

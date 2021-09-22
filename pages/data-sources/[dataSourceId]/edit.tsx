import { Button } from "@chakra-ui/react";
import { TrashIcon } from "@heroicons/react/outline"
import { toast } from "react-toastify"
import { useGetDataSourceQuery, useRemoveDataSourceMutation } from "@/features/data-sources/api-slice";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import PageWrapper from "@/components/PageWrapper";
import React, { useState } from "react";

function Edit() {
  const router = useRouter();
  const dataSourceId = router.query.dataSourceId as string;
  const [hasBeenRemoved, setHasBeenRemoved] = useState(false) // This is used to update the UI about the removal of the DS
  const { data: dataSourceResponse, isLoading: dataSourceIsLoading } =
    useGetDataSourceQuery(
      { dataSourceId },
      {
        skip: !dataSourceId,
      }
    );
  const [removeDataSource, { isLoading: dataSourceIsRemoving }] =
    useRemoveDataSourceMutation();

  const handleRemove = async () => {
    if (dataSourceIsLoading || dataSourceIsRemoving || hasBeenRemoved) return;

    const confirmed = confirm(
      "Are you sure you want to remove this data source? All information about it (settings included) will be completely removed from our servers."
    );
    if (confirmed) {
      toast(
        "The data source has been removed. You will be redirected to the homepage. Thank you!"
      );

      await removeDataSource({ dataSourceId });
      setHasBeenRemoved(true)

      await setTimeout(async () => {
        await router.push("/");
      }, 3000);
    }
  };

  return (
    <Layout>
      <PageWrapper
        heading={
          <PageWrapper.TitleCrumbs crumbs={[dataSourceResponse?.data?.name, "Edit"]} />
        }
      >
        <div className="w-full h-full flex-1 flex flex-col justify-between">
          <div>
            <div className="mt-4"></div>
          </div>
          <div className="flex justify-center">
            <Button
              colorScheme="red"
              size="sm"
              width="300px"
              onClick={handleRemove}
              isLoading={dataSourceIsRemoving}
            >
              <TrashIcon className="h-4 inline" />{" "}
              {hasBeenRemoved ? "Removed" : dataSourceIsRemoving ? "Removing" : "Remove data source"}
            </Button>
          </div>
        </div>
      </PageWrapper>
    </Layout>
  );
}

export default Edit;

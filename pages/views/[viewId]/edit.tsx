import {
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { Save } from "react-feather";
import { TrashIcon } from "@heroicons/react/outline";
import { View } from "@prisma/client";
import { pick } from "lodash";
import { useDataSourceContext } from "@/hooks";
import {
  useGetViewQuery,
  useRemoveViewMutation,
  useUpdateViewMutation,
} from "@/features/views/api-slice";
import { useRouter } from "next/router";
import BackButton from "@/features/records/components/BackButton";
import Layout from "@/components/Layout";
import PageWrapper from "@/components/PageWrapper";
import React, { useEffect, useState } from "react";
import RecordsIndex from "@/features/records/components/RecordsIndex";

const Edit = () => {
  const router = useRouter();
  const { viewId, dataSourceId } = useDataSourceContext();
  const [localView, setLocalView] = useState<View>();

  const {
    data: viewResponse,
    isLoading: viewIsLoading,
    error: viewError,
  } = useGetViewQuery({ viewId }, { skip: !viewId });

  const backLink = `/views/${viewId}/`;
  const crumbs = [viewResponse?.data?.name, "Edit"];

  const [removeView, { isLoading: viewIsRemoving }] = useRemoveViewMutation();


  useEffect(() => {
    if (viewResponse?.ok) {
      setLocalView(viewResponse.data);
    }
  }, [viewResponse]);

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

  const [updateView, { isLoading: viewIsUpdating }] = useUpdateViewMutation();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await updateView({
      viewId,
      body: pick(localView, ["name", "public", "dataSourceId", "tableName"]),
    }).unwrap();
  };


  return (
    <Layout hideSidebar={true}>
      <PageWrapper
        isLoading={viewIsLoading}
        error={viewError}
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
              onClick={handleSubmit}
              isLoading={viewIsUpdating}
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
          <div className="flex flex-shrink-0 w-1/4 border-r px-2 py-2">
            {/* <form onSubmit={handleSubmit}> */}
            { localView && (

            <form className="space-y-2">
              <FormControl id="name" size="sm" isRequired>
                <FormLabel>
                  Name
                </FormLabel>
                <Input
                  type="text"
                  name="name"
                  placeholder="ActiveUsers"
                  value={localView?.name}
                  onChange={(e) =>
                    setLocalView({
                      ...localView,
                      name: e.currentTarget.value,
                    })
                  }
                />
              </FormControl>
              <FormControl id="dataSource" isDisabled={true}>
                <FormLabel>DataSource</FormLabel>
                <Input
                  type="text"
                  name="dataSource"
                  placeholder="Id of the DataSource"
                  value={localView?.dataSourceId}
                />
              </FormControl>
              <FormControl id="tableName" isDisabled={true}>
                <FormLabel>TableName</FormLabel>
                <Input
                  type="text"
                  name="tableName"
                  placeholder="Name of the Table"
                  value={localView?.tableName}
                />
              </FormControl>
              <FormControl id="public">
                <FormLabel>Public</FormLabel>
                <Checkbox
                  size="lg"
                  colorScheme="gray"
                  checked={localView?.public}
                  onChange={(e) =>
                    setLocalView({
                      ...localView,
                      public: !localView?.public,
                    })
                  }
                />
              </FormControl>
            </form>
            )}
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

import { TrashIcon } from "@heroicons/react/outline";
import { toast } from "react-toastify";
import { useGetDataSourceQuery, useRemoveDataSourceMutation } from "@/features/data-sources/api-slice";
import { useGetTablesQuery } from "@/features/tables/tables-api-slice";
import { useRouter } from "next/router";
import React, { memo } from "react";
import SidebarItem from "./SidebarItem";

const Sidebar = () => {
  const router = useRouter();
  const dataSourceId = router.query.dataSourceId as string;
  const tableName = router.query.tableName as string;
  const {
    data: dataSourceResponse,
    isLoading: dataSourceIsLoading,
    error: dataSourceError,
  } = useGetDataSourceQuery(
    { dataSourceId },
    {
      skip: !dataSourceId,
    }
  );
  const {
    data: tablesResponse,
    isLoading,
    error,
  } = useGetTablesQuery(dataSourceId, {
    skip: !dataSourceId,
  });

  const [removeDataSource, {isLoading: dataSourceIsRemoving}] = useRemoveDataSourceMutation()

  const handleRemove = async () => {
    if (dataSourceIsLoading || dataSourceIsRemoving) return;

    const confirmed = confirm(
      "Adre you sure you want to remove this datasource?"
    );
    if (confirmed) {
      toast(
        "The data source has been removed. You will be redirected to the homepage. Thank you!"
      );

      await removeDataSource({dataSourceId})

      await setTimeout(async () => {
        await router.push("/");
      }, 3000);
    }
  };

  return (
    <div className="py-2 px-2">
      {!router.query.dataSourceId && "Select a data source"}
      <div className="space-y-x w-full">
        {dataSourceResponse?.ok && (
          <div className="my-2 mt-4 px-4 font-bold uppercase text-sm leading-none">
            {dataSourceIsLoading ? (
              "Loading..."
            ) : (
              <span>{dataSourceResponse?.data?.name}</span>
            )}
            <a
              className="mt-1 flex items-center text-xs text-gray-600 cursor-pointer"
              onClick={handleRemove}
            >
              <TrashIcon className="h-4 inline" /> {dataSourceIsRemoving ? 'removing' : 'remove'}
            </a>
          </div>
        )}
        {error && <div>Error: {error?.error}</div>}
        {isLoading && <div>loading...</div>}
        {/* @todo: why does the .data attribute remain populated with old content when the hooks has changed? */}
        {/* Got to a valid DS and then to an invalid one. the data attribute will still have the old data there. */}
        {tablesResponse?.ok &&
          tablesResponse.data.map((table: { name: string }) => (
            <SidebarItem
              active={table.name === tableName}
              label={table.name}
              link={`/data-sources/${dataSourceId}/tables/${table.name}`}
            />
          ))}
      </div>
    </div>
  );
};

export default memo(Sidebar);

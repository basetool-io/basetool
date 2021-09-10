import { ListTable } from "@/plugins/data-sources/postgresql/types";
import { TrashIcon } from "@heroicons/react/outline";
import { toast } from "react-toastify";
import {
  useGetDataSourceQuery,
  useRemoveDataSourceMutation,
} from "@/features/data-sources/api-slice";
import { useGetTablesQuery } from "@/features/tables/api-slice";
import { useRouter } from "next/router";
import LoadingOverlay from "./LoadingOverlay";
import React, { memo } from "react";
import SidebarItem from "./SidebarItem";
import isEmpty from "lodash/isEmpty";

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

  const [removeDataSource, { isLoading: dataSourceIsRemoving }] =
    useRemoveDataSourceMutation();

  const handleRemove = async () => {
    if (dataSourceIsLoading || dataSourceIsRemoving) return;

    const confirmed = confirm(
      "Are you sure you want to remove this data source? All information about it (settings included) will be completely removed from our servers."
    );
    if (confirmed) {
      toast(
        "The data source has been removed. You will be redirected to the homepage. Thank you!"
      );

      await removeDataSource({ dataSourceId });

      await setTimeout(async () => {
        await router.push("/");
      }, 3000);
    }
  };

  return (
    <div className="relative py-2 pl-2 w-full">
      {!router.query.dataSourceId && "Select a data source"}
      <div className="relative space-y-x w-full h-full overflow-auto flex flex-col">
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
              <TrashIcon className="h-4 inline" />{" "}
              {dataSourceIsRemoving ? "removing" : "remove"}
            </a>
          </div>
        )}
        {error && <div>Error: {(error as any).error}</div>}
        {isLoading && (
          <LoadingOverlay transparent={isEmpty(tablesResponse?.data)} />
        )}
        <div className="space-y-px">
          {/* @todo: why does the .data attribute remain populated with old content when the hooks has changed? */}
          {/* Got to a valid DS and then to an invalid one. the data attribute will still have the old data there. */}
          {tablesResponse?.ok &&
            tablesResponse.data
              .filter((table: ListTable) => table.schemaname === "public")
              .map((table: { name: string }, idx: number) => (
                <SidebarItem
                  key={idx}
                  active={table.name === tableName}
                  label={table.name}
                  link={`/data-sources/${dataSourceId}/tables/${table.name}`}
                />
              ))}
        </div>
      </div>
    </div>
  );
};

export default memo(Sidebar);

import { memo } from 'react'
import { useGetDataSourceQuery } from '@/features/data-sources/api-slice'
import { useGetTablesQuery } from "@/features/tables/tables-api-slice";
import { useRouter } from "next/router";
import Link from "next/link";
import classNames from "classnames";

const Sidebar = () => {
  const router = useRouter();
  const dataSourceId = router.query.dataSourceId as string;
  const tableName = router.query.tableName as string;
  const {
    data: dataSourceResponse,
    isLoading: dataSourceIsLoading,
    error: dataSourceError,
  } = useGetDataSourceQuery({dataSourceId}, {
    skip: !dataSourceId,
  });
  const {
    data: tablesResponse,
    isLoading,
    error,
  } = useGetTablesQuery(dataSourceId, {
    skip: !dataSourceId,
  });

  return (
    <div className="py-2 px-2">
      {isLoading && <div>loading...</div>}
      {error && <div>Error: {JSON.stringify(error)}</div>}
      {!router.query.dataSourceId && "Select a data source"}
      {tablesResponse?.ok &&
        <div className="space-y-x w-full">
          {isLoading && <div>loading...</div>}
          {error && <div>Error: {JSON.stringify(error)}</div>}
          {dataSourceResponse?.ok && <div className="my-2 mt-4 px-4 font-bold uppercase text-sm leading-none">{dataSourceResponse?.data?.name}</div>}
          {tablesResponse.data.map((table: { name: string }) => (
            <Link
              key={table.name}
              href={`/data-sources/${dataSourceId}/tables/${table.name}`}
            >
              <a
                className={classNames(
                  "hover:bg-blue-gray-100 overflow-hidden overflow-ellipsis w-full",
                  // text-gray-800 py-2 px-4 block font-normal hover:bg-gray-100 rounded-md mb-1 mx-3 text-sm leading-none
                  "block text-gray-800 font-normal cursor-pointer text-sm py-2 px-4 rounded-md leading-none",
                  { 'bg-blue-gray-200 hover:bg-gray-200': table.name === tableName },
                )}
              >
                {table.name}
              </a>
            </Link>
          ))}
        </div>
        }
    </div>
  );
};

export default memo(Sidebar)

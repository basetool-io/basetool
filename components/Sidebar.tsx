import { memo } from 'react'
import { useGetTablesQuery } from "@/features/tables/tables-api-slice";
import { useRouter } from "next/router";
import Link from "next/link";
import classNames from "classnames";

const Sidebar = () => {
  const router = useRouter();
  const dataSourceId = router.query.dataSourceId as string;
  const tableName = router.query.tableName as string;
  const {
    data: tablesResponse,
    isLoading,
    error,
  } = useGetTablesQuery(dataSourceId, {
    skip: !dataSourceId,
  });

  return (
    <>
      <div className="space-y-2">
        <Link href={`/data-sources`}>Home</Link>
      </div>
      {isLoading && <div>loading...</div>}
      {error && <div>Error: {JSON.stringify(error)}</div>}
      {!router.query.dataSourceId && "Select a data source"}
      {tablesResponse?.ok &&
        tablesResponse.data.map((table: { name: string }) => (
          <Link
            key={table.name}
            href={`/data-sources/${dataSourceId}/tables/${table.name}`}
          >
            <a
              className={classNames(
                "block cursor-pointer uppercase text-sm font-bold",
                { underline: table.name === tableName }
              )}
            >
              {table.name}
            </a>
          </Link>
        ))}
    </>
  );
};

export default memo(Sidebar)

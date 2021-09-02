import { Column } from "@/features/fields/types";
import { Column as ReactTableColumn } from "react-table";
import { Views } from "@/features/fields/enums";
import { isArray } from "lodash";
import { useGetColumnsQuery } from "@/features/tables/tables-api-slice";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import Link from "next/link";
import MenuItem from "@/features/fields/components/MenuItem";
import React, { memo, useMemo, useState } from "react";
import RecordsTable from "@/features/tables/components/RecordsTable";

const parseColumns = (columns: Column[]): ReactTableColumn[] =>
  columns.map((column) => ({
    Header: column.name,
    accessor: column.name,
    meta: {
      ...column,
    },
  }));

export type OrderDirection = "" | "asc" | "desc";

const ResourcesEditor = memo(
  ({
    dataSourceId,
    tableName,
    columns,
  }: {
    dataSourceId: string;
    tableName: string;
    columns: Column[];
  }) => {
    const parsedColumns = parseColumns(columns);
    const router = useRouter();
    const [orderBy, setOrderBy] = useState(router.query.orderBy as string);
    const [orderDirection, setOrderDirection] = useState<OrderDirection>(
      router.query.orderDirection as OrderDirection
    );

    return (
      <>
        {/* {!isLoading && data?.ok && ( */}
        <>
          <div className="relative flex flex-col flex-1 overflow-auto">
            <div className="flex justify-between w-full">
              <div className="flex space-x-4">
                <Link
                  href={`/data-sources/${router.query.dataSourceId}/tables/${router.query.tableName}/edit`}
                  passHref
                >
                  <MenuItem>Edit columns</MenuItem>
                </Link>
                <Link
                  href={`/data-sources/${router.query.dataSourceId}/tables/${router.query.tableName}/new`}
                  passHref
                >
                  <MenuItem>Create</MenuItem>
                </Link>
              </div>
            </div>
            <div className="relative flex-1 max-w-full w-full">
              <RecordsTable
                columns={parsedColumns}
                orderBy={orderBy}
                setOrderBy={setOrderBy}
                orderDirection={orderDirection}
                setOrderDirection={setOrderDirection}
                // data={data?.data}
                tableName={tableName}
                dataSourceId={dataSourceId}
              />
            </div>
          </div>
        </>
        {/* )} */}
      </>
    );
  }
);

ResourcesEditor.displayName = "ResourcesEditor";

function TablesShow() {
  const router = useRouter();
  const dataSourceId = router.query.dataSourceId as string;
  const tableName = router.query.tableName as string;
  const {
    data: columnsResponse,
    error,
    isLoading,
  } = useGetColumnsQuery(
    {
      dataSourceId,
      tableName,
    },
    { skip: !dataSourceId || !tableName }
  );

  const columns = useMemo(
    () =>
      isArray(columnsResponse?.data)
        ? columnsResponse?.data.filter((column: Column) =>
            column?.baseOptions.visibility?.includes(Views.index)
          )
        : [],
    [columnsResponse?.data]
  ) as Column[];

  return (
    <Layout>
      {isLoading && <div>loading...</div>}
      {error && <div>Error: {JSON.stringify(error)}</div>}
      {!isLoading && columnsResponse?.ok && (
        <ResourcesEditor
          tableName={tableName}
          columns={columns}
          dataSourceId={dataSourceId}
        />
      )}
    </Layout>
  );
}

export default memo(TablesShow);

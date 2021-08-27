import { Column } from "@/features/fields/types";
import { Column as ReactTableColumn } from "react-table";
import { Views } from "@/features/fields/enums";
import { isArray } from "lodash";
import { useGetColumnsQuery } from "@/features/tables/tables-api-slice";
import { useGetTableRecordsQuery } from "@/features/records/records-api-slice";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import Link from "next/link";
import MenuItem from "@/features/fields/components/MenuItem";
import React, { useMemo } from "react";
import RecordsTable from "@/features/tables/components/RecordsTable";

const parseColumns = (columns: Column[]): ReactTableColumn[] =>
  columns.map((column) => ({
    Header: column.name,
    accessor: column.name,
    meta: {
      ...column,
    },
  }));

const TableEditor = ({
  dataSourceId,
  tableName,
  columns,
}: {
  dataSourceId: string;
  tableName: string;
  columns: Column[];
}) => {
  const { data, error, isLoading } = useGetTableRecordsQuery({
    dataSourceId,
    tableName,
  });
  const parsedColumns = parseColumns(columns);
  const router = useRouter();

  return (
    <>
      {isLoading && <div>loading...</div>}
      {error && <div>Error: {JSON.stringify(error)}</div>}
      {!isLoading && data?.ok && (
        <>
          <div className="flex flex-col flex-1 overflow-auto">
            <div className="flex justify-end space-x-4">
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
            <div className="relative flex-1 max-w-full w-full">
              <RecordsTable
                columns={parsedColumns}
                data={data?.data}
                tableName={tableName}
                dataSourceId={dataSourceId}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};

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
        <TableEditor
          tableName={tableName}
          columns={columns}
          dataSourceId={dataSourceId}
        />
      )}
    </Layout>
  );
}

export default TablesShow;

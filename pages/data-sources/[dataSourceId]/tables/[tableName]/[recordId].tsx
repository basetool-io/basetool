import { Views } from "@/features/fields/enums";
import { useGetColumnsQuery } from "@/features/tables/tables-api-slice";
import { useGetRecordQuery } from "@/features/records/records-api-slice";
import { useRouter } from "next/router";
import Link from "next/link";
import React, { useMemo } from "react";
import isArray from "lodash/isArray";
import { Column, Record } from "@/features/fields/types";
import MenuItem from "@/features/fields/components/MenuItem";
import { makeField } from "@/features/fields";
import { getField } from "@/features/fields/factory";
import Layout from "@/components/Layout";

const RecordShow = ({
  record,
  columns,
}: {
  record: Record;
  columns: Column[];
}) => {
  const router = useRouter();

  return (
    <>
      <div className="flex flex-col">
        <div className="flex justify-end space-x-4">
          <Link
            href={`/data-sources/${router.query.dataSourceId}/tables/${router.query.tableName}`}
            passHref
          >
            <MenuItem>Back</MenuItem>
          </Link>
          <Link
            href={`/data-sources/${router.query.dataSourceId}/tables/${router.query.tableName}/${record.id}/edit`}
            passHref
          >
            <MenuItem>Edit</MenuItem>
          </Link>
        </div>
        <div>
          {columns &&
            record &&
            columns.map((column: Column) => {
              const field = makeField({
                record,
                column,
                tableName: router.query.tableName as string,
              });
              const Element = getField(column, Views.show);

              return <Element key={column.name} field={field} />;
            })}
        </div>
      </div>
    </>
  );
};

function RecordsShow() {
  const router = useRouter();
  const dataSourceId = router.query.dataSourceId as string;
  const tableName = router.query.tableName as string;
  const recordId = router.query.recordId as string;
  const { data, error, isLoading } = useGetRecordQuery(
    {
      dataSourceId,
      tableName,
      recordId,
    },
    { skip: !dataSourceId || !tableName || !recordId }
  );

  const { data: columnsResponse } = useGetColumnsQuery(
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
            column?.visibility?.includes(Views.show)
          )
        : [],
    [columnsResponse?.data]
  ) as Column[];

  return (
    <Layout>
      {isLoading && <div>loading...</div>}
      {error && <div>Error: {JSON.stringify(error)}</div>}
      {!isLoading && data?.ok && columnsResponse?.ok && (
        <RecordShow record={data.data} columns={columns} />
      )}
    </Layout>
  );
}

export default RecordsShow;

import { Button, ButtonGroup } from "@chakra-ui/button";
import { Column } from "@/features/fields/types";
import { Views } from "@/features/fields/enums";
import { getField } from "@/features/fields/factory";
import { makeField } from "@/features/fields";
import { useGetColumnsQuery } from "@/features/tables/api-slice";
import { useGetRecordQuery } from "@/features/records/api-slice";
import { useRouter } from "next/router";
import BackButton from "@/features/records/components/BackButton"
import Layout from "@/components/Layout";
import Link from "next/link";
import LoadingOverlay from "@/components/LoadingOverlay"
import PageWrapper from "@/features/records/components/PageWrapper";
import React, { useMemo } from "react";
import isArray from "lodash/isArray";
import isEmpty from "lodash/isEmpty"
import type { Record } from "@/features/records/types";

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
      <PageWrapper
        heading="View record"
        buttons={
          <>
            <ButtonGroup size="sm">
              <BackButton href={`/data-sources/${router.query.dataSourceId}/tables/${router.query.tableName}`} />
              <Link
                href={`/data-sources/${router.query.dataSourceId}/tables/${router.query.tableName}/${record.id}/edit`}
                passHref
              >
                <Button colorScheme="blue">Edit</Button>
              </Link>
            </ButtonGroup>
          </>
        }
      >
        <>
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
        </>
      </PageWrapper>
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
            column.baseOptions.visibility?.includes(Views.show)
          )
        : [],
    [columnsResponse?.data]
  ) as Column[];

  return (
    <Layout>
      {isLoading && <LoadingOverlay transparent={isEmpty(data?.data)} />}
      {error && <div>Error: {JSON.stringify(error)}</div>}
      {!isLoading && data?.ok && columnsResponse?.ok && (
        <RecordShow record={data.data} columns={columns} />
      )}
    </Layout>
  );
}

export default RecordsShow;

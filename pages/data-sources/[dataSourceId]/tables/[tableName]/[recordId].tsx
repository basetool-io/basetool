import { Button, ButtonGroup } from "@chakra-ui/button";
import { Column } from "@/features/fields/types";
import { Views } from "@/features/fields/enums";
import { getField } from "@/features/fields/factory";
import { makeField } from "@/features/fields";
import { useDeleteRecordMutation, useGetRecordQuery } from "@/features/records/api-slice";
import { useGetColumnsQuery } from "@/features/tables/api-slice";
import { useRouter } from "next/router";
import BackButton from "@/features/records/components/BackButton";
import Head from "next/head"
import Layout from "@/components/Layout";
import Link from "next/link";
import LoadingOverlay from "@/components/LoadingOverlay";
import PageWrapper from "@/components/PageWrapper";
import React, { useMemo } from "react";
import isArray from "lodash/isArray";
import isEmpty from "lodash/isEmpty";
import type { Record } from "@/features/records/types";

const RecordShow = ({
  record,
  columns,
}: {
  record: Record;
  columns: Column[];
}) => {
  const router = useRouter();
  const backLink = useMemo(() => {
    if (router.query.fromTable) {
      if (router.query.fromRecord) {
        return `/data-sources/${router.query.dataSourceId}/tables/${router.query.fromTable}/${router.query.fromRecord}`;
      } else {
        return `/data-sources/${router.query.dataSourceId}/tables/${router.query.fromTable}`;
      }
    }

    return `/data-sources/${router.query.dataSourceId}/tables/${router.query.tableName}`;
  }, [router.query]);

  const [deleteRecord, { isLoading: isDeleting }] = useDeleteRecordMutation();

  const onDeleteClick = async () => {
    const confirmed = confirm(
      "Are you sure you want to remove this record?"
    );
    if (confirmed) {
      const response = await deleteRecord({
        dataSourceId: router.query.dataSourceId as string,
        tableName: router.query.tableName as string,
        recordId: record.id.toString(),
      });

      if ("data" in response && response?.data?.ok) {
        // @todo: make the response into a pretty message
      }

      router.push(backLink);
    }
  }

  return (
    <>
      <PageWrapper
        heading="View record"
        buttons={
          <>
            {isDeleting && <LoadingOverlay transparent={true} />}
            <ButtonGroup size="sm">
              <BackButton href={backLink} />
              <Button colorScheme="red" onClick={onDeleteClick}>Delete</Button>
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
    <>
      <Layout>
        <Head>
          <title>View record {data?.data?.id} | 👋 Hi!</title>
        </Head>
        {isLoading && <LoadingOverlay transparent={isEmpty(data?.data)} />}
        {error && <div>Error: {JSON.stringify(error)}</div>}
        {!isLoading && data?.ok && columnsResponse?.ok && (
          <RecordShow record={data.data} columns={columns} />
        )}
      </Layout>
    </>
  );
}

export default RecordsShow;

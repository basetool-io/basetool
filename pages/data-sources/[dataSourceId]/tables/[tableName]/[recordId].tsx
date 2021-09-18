import { Button, ButtonGroup } from "@chakra-ui/button";
import { Column } from "@/features/fields/types";
import { EyeIcon, PencilAltIcon } from "@heroicons/react/outline";
import { Views } from "@/features/fields/enums";
import { getField } from "@/features/fields/factory";
import { makeField } from "@/features/fields";
import { useGetColumnsQuery } from "@/features/tables/api-slice";
import { useGetRecordQuery } from "@/features/records/api-slice";
import { useRouter } from "next/router";
import BackButton from "@/features/records/components/BackButton";
import Head from "next/head";
import Layout from "@/components/Layout";
import Link from "next/link";
import LoadingOverlay from "@/components/LoadingOverlay";
import PageWrapper from "@/components/PageWrapper";
import React, { useMemo } from "react";
import isArray from "lodash/isArray";
import isEmpty from "lodash/isEmpty";

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

  const record = useMemo(() => data?.data, [data?.data]);

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

  return (
    <>
      <Layout>
        <Head>
          <title>View record {data?.data?.id} | 👋 Hi!</title>
        </Head>
        {isLoading && <LoadingOverlay transparent={isEmpty(data?.data)} />}
        {error && <div>Error: {JSON.stringify(error)}</div>}
        {!isLoading && data?.ok && columnsResponse?.ok && (
          <>
            <PageWrapper
              icon={<EyeIcon className="inline h-5 text-gray-500" />}
              heading="View record"
              flush={true}
              buttons={
                <>
                  <ButtonGroup size="sm">
                    <BackButton href={backLink} />
                    <Link
                      href={`/data-sources/${router.query.dataSourceId}/tables/${router.query.tableName}/${record.id}/edit`}
                      passHref
                    >
                      <Button
                        as="a"
                        colorScheme="blue"
                        leftIcon={<PencilAltIcon className="h-4" />}
                      >
                        Edit
                      </Button>
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
        )}
      </Layout>
    </>
  );
}

export default RecordsShow;

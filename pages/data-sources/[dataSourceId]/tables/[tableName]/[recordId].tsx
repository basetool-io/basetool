import { Button } from "@chakra-ui/button";
import { Column } from "@/features/fields/types";
import { EyeIcon, PencilAltIcon, TrashIcon } from "@heroicons/react/outline";
import { Views } from "@/features/fields/enums";
import { getField } from "@/features/fields/factory";
import { getFilteredColumns, makeField } from "@/features/fields";
import { useAccessControl, useProfile } from "@/hooks";
import {
  useDeleteRecordMutation,
  useGetRecordQuery,
} from "@/features/records/api-slice";
import { useGetColumnsQuery } from "@/features/tables/api-slice";
import { useRouter } from "next/router";
import BackButton from "@/features/records/components/BackButton";
import Head from "next/head";
import Layout from "@/components/Layout";
import Link from "next/link";
import LoadingOverlay from "@/components/LoadingOverlay";
import PageWrapper from "@/components/PageWrapper";
import React, { useEffect, useMemo } from "react";
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
    () => getFilteredColumns(columnsResponse?.data, Views.show),
    [columnsResponse?.data]
  );

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

  const ac = useAccessControl();

  const [deleteRecord, { isLoading: isDeleting }] = useDeleteRecordMutation();

  const handleDelete = async () => {
    const confirmed = confirm("Are you sure you want to remove this record?");
    if (confirmed) {
      const response = await deleteRecord({
        dataSourceId: router.query.dataSourceId as string,
        tableName: router.query.tableName as string,
        recordId: record.id.toString(),
      }).unwrap();

      if (response?.ok) router.push(backLink);
    }
  };

  const { isLoading: profileIsLoading } = useProfile();
  const canRead = useMemo(() => {
    if (profileIsLoading) return true;

    return ac.readAny("record").granted;
  }, [ac, profileIsLoading]);

  // Redirect to record page if the user can't read
  useEffect(() => {
    if (!canRead && router) {
      router.push(`/data-sources/${dataSourceId}/tables/${tableName}`);
    }
  }, [canRead, router]);

  // Don't show them the show page if the user can't read
  if (!canRead) return "";

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
              crumbs={[router.query.tableName as string, "View record"]}
              flush={true}
              buttons={<BackButton href={backLink} />}
              footer={
                <PageWrapper.Footer
                  left={
                    ac.deleteAny("record").granted && (
                      <Button
                        className="text-red-600 text-sm cursor-pointer"
                        onClick={() => !isDeleting && handleDelete()}
                        variant="link"
                        colorScheme="red"
                        leftIcon={<TrashIcon className="h-4" />}
                      >
                        Delete
                      </Button>
                    )
                  }
                  right={
                    ac.updateAny("record").granted && (
                      <Link
                        href={`/data-sources/${router.query.dataSourceId}/tables/${router.query.tableName}/${record.id}/edit`}
                        passHref
                      >
                        <Button
                          as="a"
                          colorScheme="blue"
                          size="sm"
                          variant="link"
                          leftIcon={<PencilAltIcon className="h-4" />}
                        >
                          Edit
                        </Button>
                      </Link>
                    )
                  }
                />
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

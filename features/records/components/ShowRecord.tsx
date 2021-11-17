import { Button } from "@chakra-ui/button";
import { Column } from "@/features/fields/types";
import { EyeIcon, PencilAltIcon, TrashIcon } from "@heroicons/react/outline";
import { getField } from "@/features/fields/factory";
import { getFilteredColumns, makeField } from "@/features/fields";
import { sortBy } from "lodash"
import { useAccessControl, useDataSourceContext, useProfile } from "@/hooks";
import {
  useDeleteRecordMutation,
  useGetRecordQuery,
} from "@/features/records/api-slice";
import { useGetColumnsQuery } from "@/features/fields/api-slice";
import { useGetDataSourceQuery } from "@/features/data-sources/api-slice";
import { useRouter } from "next/router";
import BackButton from "@/features/records/components/BackButton";
import Head from "next/head";
import Layout from "@/components/Layout";
import Link from "next/link";
import LoadingOverlay from "@/components/LoadingOverlay";
import PageWrapper from "@/components/PageWrapper";
import React, { memo, useEffect, useMemo } from "react";
import isEmpty from "lodash/isEmpty";

const ShowRecord = () => {
  const router = useRouter();
  const { dataSourceId, tableName, recordId, tableIndexPath, recordsPath, viewId } =
    useDataSourceContext();
  const { data: dataSourceResponse } = useGetDataSourceQuery(
    { dataSourceId },
    {
      skip: !dataSourceId,
    }
  );
  const { data, error, isLoading } = useGetRecordQuery(
    {
      dataSourceId,
      tableName,
      recordId,
      viewId,
    },
    { skip: !dataSourceId || !tableName || !recordId }
  );

  const { data: columnsResponse } = useGetColumnsQuery(
    {
      dataSourceId,
      tableName,
      viewId,
    },
    { skip: !dataSourceId || !tableName }
  );

  const columns = useMemo(
    () =>
      sortBy(getFilteredColumns(columnsResponse?.data, "show"), [
        (column: Column) => column?.baseOptions?.orderIndex,
      ]),
    [columnsResponse?.data]
  );

  const record = useMemo(() => data?.data, [data?.data]);

  const ac = useAccessControl();

  const [deleteRecord, { isLoading: isDeleting }] = useDeleteRecordMutation();

  const handleDelete = async () => {
    const confirmed = confirm("Are you sure you want to remove this record?");
    if (confirmed) {
      const response = await deleteRecord({
        dataSourceId: dataSourceId,
        tableName: tableName,
        recordId: record.id.toString(),
      }).unwrap();

      if (response?.ok) router.push(tableIndexPath);
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
      router.push(tableIndexPath);
    }
  }, [canRead, router]);

  // Don't show them the show page if the user can't read
  if (!canRead) return null;

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
              buttons={<BackButton href={tableIndexPath} />}
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
                    ac.updateAny("record").granted &&
                    !dataSourceResponse?.meta?.dataSourceInfo?.readOnly && (
                      <Link href={`${recordsPath}/${record.id}/edit`} passHref>
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
                    const Element = getField(column, "show");

                    return <Element key={column.name} field={field} />;
                  })}
              </>
            </PageWrapper>
          </>
        )}
      </Layout>
    </>
  );
};

export default memo(ShowRecord);

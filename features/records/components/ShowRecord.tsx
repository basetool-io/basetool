import { Button } from "@chakra-ui/button";
import { Column } from "@/features/fields/types";
import { EyeIcon, PencilAltIcon, TrashIcon } from "@heroicons/react/outline";
import {
  getConnectedColumns,
  getVisibleColumns,
  makeField,
} from "@/features/fields";
import { getField } from "@/features/fields/factory";
import { sortBy } from "lodash";
import { useACLHelpers } from "@/features/authorization/hooks";
import { useDataSourceContext } from "@/hooks";
import { useDataSourceResponse } from "@/features/data-sources/hooks";
import {
  useDeleteRecordMutation,
  useGetRecordQuery,
} from "@/features/records/api-slice";
import { useGetColumnsQuery } from "@/features/fields/api-slice";
import { useRouter } from "next/router";
import BackButton from "@/features/records/components/BackButton";
import ErrorMessage from "@/components/ErrorMessage";
import Head from "next/head";
import Layout from "@/components/Layout";
import Link from "next/link";
import LoadingOverlay from "@/components/LoadingOverlay";
import PageWrapper from "@/components/PageWrapper";
import React, { memo, useEffect, useMemo } from "react";
import isEmpty from "lodash/isEmpty";

const ShowRecord = () => {
  const router = useRouter();
  const {
    dataSourceId,
    tableName,
    recordId,
    tableIndexPath,
    recordsPath,
    viewId,
  } = useDataSourceContext();
  const { info } = useDataSourceResponse(dataSourceId);
  const {
    data: recordResponse,
    error,
    isLoading,
  } = useGetRecordQuery(
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

  // Figure out where we should fetch the columns from.
  // If the data source can fetch the columns ahead of time use those, if not, fetch from the records response.
  // We should probably use just one source in the future.
  const rawColumns = useMemo(() => {
    if (recordResponse?.ok && info?.supports?.columnsRequest === false) {
      return recordResponse?.meta?.columns;
    } else if (columnsResponse?.ok) {
      return columnsResponse?.data;
    } else {
      return [];
    }
  }, [info, recordResponse, columnsResponse]);

  const columns = useMemo(() => {
    const result = getConnectedColumns(getVisibleColumns(rawColumns, "show"));

    return sortBy(result, [(column) => column?.baseOptions?.orderIndex]);
  }, [rawColumns]);

  const record = useMemo(() => recordResponse?.data, [recordResponse?.data]);

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

  const { canView, canEdit, canDelete } = useACLHelpers({
    dataSourceInfo: info,
  });

  // Redirect to record page if the user can't read
  useEffect(() => {
    if (!canView && router) {
      router.push(tableIndexPath);
    }
  }, [canView, router]);

  // Don't show them the show page if the user can't read
  if (!canView) return null;

  const DeleteButton = () => (
    <Button
      className="text-red-600 text-sm cursor-pointer"
      onClick={() => !isDeleting && handleDelete()}
      variant="link"
      colorScheme="red"
      leftIcon={<TrashIcon className="h-4" />}
    >
      Delete
    </Button>
  );

  const EditButton = () => (
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
  );

  return (
    <>
      <Layout>
        <Head>
          <title>View record {recordResponse?.data?.id} | 👋 Hi!</title>
        </Head>
        {isLoading && (
          <LoadingOverlay transparent={isEmpty(recordResponse?.data)} />
        )}
        {error && (
          <>
            {"status" in error && error?.status === 404 && (
              <ErrorMessage message="404, Record not found" />
            )}
            {!("status" in error) && (
              <ErrorMessage error={JSON.stringify(error)} />
            )}
          </>
        )}
        {!isLoading && recordResponse?.ok && columnsResponse?.ok && (
          <>
            <PageWrapper
              icon={<EyeIcon className="inline h-5 text-gray-500" />}
              crumbs={[tableName, "View record"]}
              flush={true}
              buttons={<BackButton href={tableIndexPath} />}
              footer={
                <PageWrapper.Footer
                  left={canDelete && <DeleteButton />}
                  right={canEdit && <EditButton />}
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

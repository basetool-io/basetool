import { Column } from "@/features/fields/types";
import { getConnectedColumns, getVisibleColumns } from "@/features/fields";
import { isEmpty, sortBy } from "lodash";
import { useACLHelpers } from "@/features/authorization/hooks";
import { useDataSourceContext } from "@/hooks";
import { useDataSourceResponse } from "@/features/data-sources/hooks";
import { useGetColumnsQuery } from "@/features/fields/api-slice";
import { useGetRecordQuery } from "@/features/records/api-slice";
import { useRouter } from "next/router";
import ErrorMessage from "@/components/ErrorMessage";
import Form from "@/features/records/components/Form";
import Layout from "@/components/Layout";
import LoadingOverlay from "@/components/LoadingOverlay";
import React, { memo, useEffect, useMemo } from "react";

const EditRecord = () => {
  const router = useRouter();
  const { dataSourceId, tableName, recordId, recordsPath, viewId } =
    useDataSourceContext();

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

  const columns = useMemo(
    () =>
      sortBy(
        getConnectedColumns(getVisibleColumns(columnsResponse?.data, "edit")),
        [(column: Column) => column?.baseOptions?.orderIndex]
      ),
    [columnsResponse?.data]
  );

  const record = useMemo(
    () => recordResponse?.data || {},
    [recordResponse?.data]
  );

  const { info } = useDataSourceResponse(dataSourceId);
  const { canEdit } = useACLHelpers({ dataSourceInfo: info });

  // Redirect to record page if the user can't edit
  useEffect(() => {
    if (!canEdit) {
      router.push(`${recordsPath}/${recordId}`);
    }
  }, [canEdit]);
  const isReadOnly = useMemo(() => info?.readOnly, [info]);

  const formIsVisible = useMemo(
    () =>
      !isReadOnly && !isLoading && recordResponse?.ok && columnsResponse?.ok,
    [isReadOnly, isLoading, recordResponse?.ok, columnsResponse?.ok]
  );

  // Don't show them the edit page if the user can't edit
  if (!canEdit) return null;

  return (
    <Layout>
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
      {isReadOnly && <ErrorMessage message="Cannot edit record" />}
      {formIsVisible && <Form record={record} columns={columns} />}
    </Layout>
  );
};

export default memo(EditRecord);

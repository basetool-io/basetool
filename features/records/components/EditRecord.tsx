import { Column } from "@/features/fields/types";
import { getFilteredColumns } from "@/features/fields";
import { isEmpty, sortBy } from "lodash";
import { useAccessControl, useDataSourceContext, useProfile } from "@/hooks";
import { useGetColumnsQuery } from "@/features/fields/api-slice";
import { useGetDataSourceQuery } from "@/features/data-sources/api-slice";
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
      sortBy(getFilteredColumns(columnsResponse?.data, "edit"), [
        (column: Column) => column?.baseOptions?.orderIndex,
      ]),
    [columnsResponse?.data]
  );

  const record = useMemo(
    () => recordResponse?.data || {},
    [recordResponse?.data]
  );

  const { isLoading: profileIsLoading } = useProfile();
  const ac = useAccessControl();
  const canEdit = useMemo(() => {
    if (profileIsLoading) return true;

    return ac.updateAny("record").granted;
  }, [ac, profileIsLoading]);

  // Redirect to record page if the user can't edit
  useEffect(() => {
    if (!canEdit) {
      router.push(`${recordsPath}/${recordId}`);
    }
  }, [canEdit]);

  const { data: dsResponse } = useGetDataSourceQuery(
    { dataSourceId },
    { skip: !dataSourceId }
  );

  const isReadOnly = useMemo(
    () => dsResponse?.ok && dsResponse?.meta?.dataSourceInfo?.readOnly,
    [dsResponse]
  );

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
      {error && <div>Error: {JSON.stringify(error)}</div>}
      {isReadOnly && <ErrorMessage message="Cannot edit record" />}
      {formIsVisible && <Form record={record} columns={columns} />}
    </Layout>
  );
};

export default memo(EditRecord);

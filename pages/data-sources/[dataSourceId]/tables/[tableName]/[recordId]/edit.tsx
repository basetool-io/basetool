import { Views } from "@/features/fields/enums";
import { getFilteredColumns } from "@/features/fields";
import { isEmpty } from "lodash";
import { useAccessControl } from "@/hooks";
import { useGetColumnsQuery } from "@/features/tables/api-slice";
import { useGetRecordQuery } from "@/features/records/api-slice";
import { useRouter } from "next/router";
import Form from "@/features/records/components/Form";
import Layout from "@/components/Layout";
import LoadingOverlay from "@/components/LoadingOverlay";
import React, { useEffect, useMemo } from "react";

function RecordsEdit() {
  const router = useRouter();
  const dataSourceId = router.query.dataSourceId as string;
  const tableName = router.query.tableName as string;
  const recordId = router.query.recordId as string;
  const {
    data: recordResponse,
    error,
    isLoading,
  } = useGetRecordQuery(
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
    () => getFilteredColumns(columnsResponse?.data, Views.index),
    [columnsResponse?.data]
  );

  const ac = useAccessControl();
  const canEdit = useMemo(() => ac.updateAny("record").granted, [ac]);

  // Redirect to record page if the user can't edit
  useEffect(() => {
    if (!canEdit && router) {
      router.push(
        `/data-sources/${dataSourceId}/tables/${tableName}/${recordId}`
      );
    }
  }, [canEdit, router]);

  // Don't show them the edit page if the user can't edit
  if (!canEdit) return "";

  return (
    <Layout>
      {isLoading && (
        <LoadingOverlay transparent={isEmpty(recordResponse?.data)} />
      )}
      {error && <div>Error: {JSON.stringify(error)}</div>}
      {!isLoading && recordResponse?.ok && columnsResponse?.ok && (
        <Form record={recordResponse.data} columns={columns} />
      )}
    </Layout>
  );
}

export default RecordsEdit;
